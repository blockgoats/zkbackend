
include "/home/nishanth/Downloads/sb1-na86wq(1)/backend/node_modules/circomlib/circuits/bitify.circom";
include "/home/nishanth/Downloads/sb1-na86wq(1)/backend/node_modules/circomlib/circuits/poseidon.circom";

template IdentityVerification() {
    signal input identity;
    signal input nonce;
    signal output hash;

    component poseidon = Poseidon(2);
    poseidon.inputs[0] <== identity;
    poseidon.inputs[1] <== nonce;
    hash <== poseidon.out;
}

component main = IdentityVerification();