# 🌿 let-go-frustration (`letgo`)

A lightweight Node.js CLI tool that clears your terminal, displays a centered nature scene, and reminds you to take a quick breather when debugging gets frustrating.

Works in the VS Code integrated terminal, iTerm2, macOS Terminal, and standard ANSI terminals.

---

## 📦 Installation

Install globally via npm to use the `letgo` command anywhere in your terminal:

```bash
npm install -g let-go-frustration
```

Or run it instantly without installing using `npx`:

```bash
npx let-go-frustration
```

---

## ⚙️ Important Setup for VS Code Users

By default, VS Code disables inline images in the integrated terminal. For the images to display properly, enable the setting once:

1. Open VS Code Settings (**Cmd + ,** on macOS or **Ctrl + ,** on Windows/Linux).
2. Search for **`terminal.integrated.enableImages`**.
3. Check the box for **Terminal › Integrated: Enable Images** (or add `"terminal.integrated.enableImages": true` to your `settings.json`).
4. Kill your current terminal session (click the **Trash Can icon**) and open a fresh terminal.

---

## 🚀 Usage

### 1. Display a random relaxing nature scene
```bash
letgo
```

### 2. Display a custom image once
Pass a path to any `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, or `.tiff` file:
```bash
letgo ./my-photo.jpg
letgo --image ~/Pictures/sunset.png
letgo -i ~/Pictures/sunset.png
```

### 3. Permanently add an image to your collection
Save any image into your local `letgo` collection so it appears in future random runs:
```bash
letgo --add ~/Pictures/mountains.jpg
letgo -a ~/Pictures/forest.png
```

### 4. High-Definition inline mode (Optional)
For terminals with inline image protocol support (such as iTerm2 or VS Code with `terminal.integrated.enableImages` enabled):
```bash
letgo --hd
```

---

## 🛠️ CLI Options

| Flag / Argument | Alias | Description |
| :--- | :--- | :--- |
| `letgo` | — | Clears the terminal and renders a random centered nature image |
| `<file>` | — | Renders a specific image file once |
| `--image <file>` | `-i` | Renders a specific image file once |
| `--add <file>` | `-a` | Copies an image into the local `assets/` collection for future runs |
| `--hd` | — | Uses the native iTerm2/VS Code inline image protocol |
| `--help` | `-h` | Displays the help menu |
| `--version` | `-v` | Displays the current package version |

---

## 📄 License

MIT © [Kritarth Patel](https://github.com/KritarthPatel)