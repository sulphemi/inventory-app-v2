with import <nixpkgs> {};
mkShell {
    buildInputs = [
        postgresql
        nodejs
    ];
}
