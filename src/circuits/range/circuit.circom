pragma circom 2.1.4;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

template RangeProof(n) {
    signal input in;
    signal input min;
    signal input max;
    signal output out;

    // Convert input to bits for comparison
    component n2b = Num2Bits(n);
    n2b.in <== in;

    // Check if in >= min
    component gte = GreaterEqThan(n);
    gte.in[0] <== in;
    gte.in[1] <== min;

    // Check if in <= max
    component lte = LessEqThan(n);
    lte.in[0] <== in;
    lte.in[1] <== max;

    // Output is 1 if both conditions are met
    out <== gte.out * lte.out;
}

component main { public [ min, max ] } = RangeProof(64);