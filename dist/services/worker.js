import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { logger } from '../utils/logger.js';
import { ZKPService } from './zkp.js';
class ProofWorker {
    static initialize() {
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
        }
        else {
            // Worker thread code
            this.setupWorker();
        }
    }
    static async verifyProof(proof) {
        return this.assignTask({
            type: 'VERIFY_PROOF',
            data: proof
        });
    }
    static async generateProof(input) {
        return this.assignTask({
            type: 'GENERATE_PROOF',
            data: input
        });
    }
    static async assignTask(message) {
        return new Promise((resolve, reject) => {
            // Find least busy worker
            const worker = this.workers.reduce((prev, curr) => curr.activeJobs < prev.activeJobs ? curr : prev);
            worker.activeJobs = (worker.activeJobs || 0) + 1;
            worker.once('message', (result) => {
                worker.activeJobs--;
                if (result.error) {
                    reject(new Error(result.error));
                }
                else {
                    resolve(result.data);
                }
            });
            worker.postMessage(message);
        });
    }
    static setupWorker() {
        parentPort?.on('message', async (message) => {
            try {
                let result;
                switch (message.type) {
                    case 'VERIFY_PROOF':
                        result = await ZKPService.verifyProof(message.data.id, message.data.proof);
                        break;
                    case 'GENERATE_PROOF':
                        result = await ZKPService.generateProof(message.data.userId, message.data.request);
                        break;
                    case 'SHUTDOWN':
                        process.exit(0);
                        break;
                }
                parentPort?.postMessage({ data: result });
            }
            catch (error) {
                parentPort?.postMessage({
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        logger.info(`Worker ${workerData.workerId} initialized`);
    }
    static handleWorkerMessage(message) {
        logger.debug('Worker message received', { message });
    }
    static handleWorkerError(error) {
        logger.error('Worker error', { error });
    }
    static handleWorkerExit(code) {
        logger.info(`Worker exited with code ${code}`);
    }
    static async shutdown() {
        logger.info('Shutting down proof workers');
        await Promise.all(this.workers.map(worker => new Promise((resolve) => {
            worker.once('exit', () => resolve());
            worker.postMessage({ type: 'SHUTDOWN' });
        })));
        this.workers = [];
    }
}
ProofWorker.workers = [];
ProofWorker.MAX_WORKERS = 4;
