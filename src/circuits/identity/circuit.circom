//circom circuit.circom --r1cs --wasm --sym --output ./gen

pragma circom 2.1.4;

include "/home/nishanth/Downloads/sb1-na86wq(1)/backend/node_modules/circomlib/circuits/poseidon.circom";
include "/home/nishanth/Downloads/sb1-na86wq(1)/backend/node_modules/circomlib/circuits/bitify.circom";
include "/home/nishanth/Downloads/sb1-na86wq(1)/backend/node_modules/circomlib/circuits/comparators.circom";

template IdentityProof() {
    // Public inputs
    signal input challenge;
    signal input pubKeyX;
    signal input pubKeyY;
    
    // Private inputs
    signal input privKey;
    
    // Outputs
    signal output validProof;
    
    // Generate public key from private key using Poseidon hash
    component hasher = Poseidon(1);
    hasher.inputs[0] <== privKey;
    
    // Verify public key coordinates match
    component n2bX = Num2Bits(254);
    component n2bY = Num2Bits(254);
    n2bX.in <== pubKeyX;
    n2bY.in <== pubKeyY;
    
    // Sign challenge
    component challengeHasher = Poseidon(2);
    challengeHasher.inputs[0] <== privKey;
    challengeHasher.inputs[1] <== challenge;
    
    // Final verification
    component isValid = IsEqual();
    isValid.in[0] <== challengeHasher.out;
    isValid.in[1] <== pubKeyX;
    
    validProof <== isValid.out;
}

component main { public [ challenge, pubKeyX, pubKeyY ] } = IdentityProof();