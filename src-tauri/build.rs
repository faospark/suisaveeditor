use std::fs;
use std::path::Path;

fn copy_dir_all(src: impl AsRef<Path>, dst: impl AsRef<Path>) -> std::io::Result<()> {
    fs::create_dir_all(&dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        if ty.is_dir() {
            copy_dir_all(entry.path(), dst.as_ref().join(entry.file_name()))?;
        } else {
            fs::copy(entry.path(), dst.as_ref().join(entry.file_name()))?;
        }
    }
    Ok(())
}

fn sync_dist() {
    let root = Path::new("..");
    let dist = Path::new("../dist");
    let _ = fs::create_dir_all(dist);

    let files = ["index.html", "README.md", "CHANGELOG.md"];
    for f in &files {
        let src = root.join(f);
        if src.exists() {
            let _ = fs::copy(&src, dist.join(f));
        }
    }

    let dirs = ["css", "src", "image", "public", "debug"];
    for d in &dirs {
        let src = root.join(d);
        if src.exists() {
            let _ = copy_dir_all(&src, dist.join(d));
        }
    }
}

fn main() {
    println!("cargo:rerun-if-changed=../src");
    println!("cargo:rerun-if-changed=../css");
    println!("cargo:rerun-if-changed=../index.html");
    println!("cargo:rerun-if-changed=../README.md");
    println!("cargo:rerun-if-changed=../CHANGELOG.md");
    sync_dist();
    tauri_build::build();
}
