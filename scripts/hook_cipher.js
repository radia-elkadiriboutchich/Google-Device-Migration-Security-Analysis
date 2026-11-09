Java.perform(function () {
    function bytesToHex(bytes) {
        if (!bytes) return "null";
        var hex = [];
        for (var i = 0; i < bytes.length; ++i) {
            var h = (bytes[i] & 0xFF).toString(16);
            hex.push(h.length === 1 ? '0' + h : h);
        }
        return hex.join('');
    }

    var Cipher = Java.use('javax.crypto.Cipher');

    // Interception de l'initialisation (capture de la clé)
    Cipher.init.overload('int', 'java.security.Key', 'java.security.spec.AlgorithmParameterSpec').implementation = 
    function (opmode, key, params) {
        var algo = this.getAlgorithm();
        console.log("[+] Chiffrement intercepté ! Algorithme: " + algo);
        console.log("[+] Mode opératoire (1=Enc, 2=Dec, 4=Unwrap): " + opmode);
        return this.init(opmode, key, params);
    };
});
