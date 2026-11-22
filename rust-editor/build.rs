fn main() {
    #[cfg(windows)]
    {
        println!("cargo:rerun-if-changed=../src-tauri/icons/icon.ico");
        let mut res = winresource::WindowsResource::new();
        res.set_icon("../src-tauri/icons/icon.ico");
        res.set("ProductName", "Bright Shield Save Editor");
        res.set("FileDescription", "Bright Shield Save Editor — Suikoden II HD Remaster");
        res.set("OriginalFilename", "BrightShield.exe");
        res.compile().expect("Failed to compile Windows icon resource");
    }
}
