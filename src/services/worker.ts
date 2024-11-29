import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { logger } from '../utils/logger.js';
import { ZKPService } from './zkp.js';
import { BatchVerifier } from './batchVerifier.js';
import type { ZKProof } from '../types/zkp.js';

interface WorkerMessage {
  type: 'VERIFY_PROOF' | 'GENERATE_PROOF' | 'SHUTDOWN';
  data: any;
}

class ProofWorker {
  private static workers: Worker[] = [];
  private static readonly MAX_WORKERS = 4;

  static initialize(): void {
    if (isMainThread) {
      for (let i = 0; i < this.MAX_WORKERS; i++) {
        const worker = new Worker(__filename, {
          workerData: { workerId: i }
        });

        worker.on('message', this.handleWorkerMessage);
        worker.on('error', this.handleWorkerError);
        worker.on('exit', this.handleWorkerExit);

        this.workers.push(worker);
      }

      logger.info(`Initialized ${this.MAX_WORKERS} proof workers`);
    } else {
      // Worker thread code
      this.setupWorker();
    }
  }

  static async verifyProof(proof: ZKProof): Promise<boolean> {
    return this.assignTask({
      type: 'VERIFY_PROOF',
      data: proof
    });
  }

  static async generateProof(input: any): Promise<ZKProof> {
    return this.assignTask({
      type: 'GENERATE_PROOF',
      data: input
    });
  }

  private static async assignTask(message: WorkerMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      // Find least busy worker
      const worker = this.workers.reduce((prev, curr) => 
        (curr as any).activeJobs < (prev as any).activeJobs ? curr : prev
      );

      (worker as any).activeJobs = ((worker as any).activeJobs || 0) + 1;

      worker.once('message', (result) => {
        (worker as any).activeJobs--;
        if (result.error) {
          reject(new Error(result.error));
        } else {
          resolve(result.data);
        }
      });

      worker.postMessage(message);
    });
  }

  private static setupWorker(): void {
    parentPort?.on('message', async (message: WorkerMessage) => {
      try {
        let result;

        switch (message.type) {
          case 'VERIFY_PROOF':
            result = await ZKPService.verifyProof(
              message.data.id,
              message.data.proof
            );
            break;

          case 'GENERATE_PROOF':
            result = await ZKPService.generateProof(
              message.data.userId,
              message.data.request
            );
            break;

          case 'SHUTDOWN':
            process.exit(0);
            break;
        }

        parentPort?.postMessage({ data: result });
      } catch (error) {
        parentPort?.postMessage({
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    logger.info(`Worker ${workerData.workerId} initialized`);
  }

  private static handleWorkerMessage(message: any): void {
    logger.debug('Worker message received', { message });
  }

  private static handleWorkerError(error: Error): void {
    logger.error('Worker error', { error });
  }

  private static handleWorkerExit(code: number): void {
    logger.info(`Worker exited with code ${code}`);
  }

  static async shutdown(): Promise<void> {
    logger.info('Shutting down proof workers');

    await Promise.all(
      this.workers.map(worker =>
        new Promise<void>((resolve) => {
          worker.once('exit', () => resolve());
          worker.postMessage({ type: 'SHUTDOWN' });
        })
      )
    );

    this.workers = [];
  }
}