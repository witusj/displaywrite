document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const statusBar = document.getElementById('statusBar');
    const ruler = document.getElementById('ruler');
    const fileInput = document.getElementById('fileInput');
    const functionKeyButtons = document.querySelectorAll('.dw-function-keys button');

    let currentFileName = 'untitled.txt';
    let currentMode = 'INS'; // INS or OVR (for simplicity, we'll just display it)

    function updateStatusBar() {
        const text = editor.value;
        const cursorPos = editor.selectionStart;
        let line = 1;
        let col = 1;

        for (let i = 0; i < cursorPos; i++) {
            if (text[i] === '\n') {
                line++;
                col = 1;
            } else {
                col++;
            }
        }
        statusBar.textContent = `Ln: ${line} Col: ${col} | ${currentMode} | File: ${currentFileName}`;
    }

    function generateRuler() {
        const editorWidthChars = 80; // Approximate characters, adjust based on your .dw-container width and font
        let rulerContent = '';
        for (let i = 1; i <= editorWidthChars; i++) {
            if (i % 10 === 0) {
                rulerContent += Math.floor(i / 10);
            } else if (i % 5 === 0) {
                rulerContent += '+';
            } else {
                rulerContent += '-';
            }
        }
        ruler.textContent = "·" + rulerContent.substring(1); // Start with a dot for char 1
    }

    // --- Event Listeners ---
    editor.addEventListener('input', updateStatusBar);
    editor.addEventListener('click', updateStatusBar);
    editor.addEventListener('keyup', (event) => { // For arrow keys, pgup/dn etc.
        updateStatusBar();
        // Potentially handle special keys like Insert for mode toggle
        if (event.key === "Insert") {
            currentMode = (currentMode === "INS") ? "OVR" : "INS";
            updateStatusBar();
            // Note: Actual OVR mode in textarea is complex, not implemented here
        }
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                editor.value = e.target.result;
                currentFileName = file.name;
                updateStatusBar();
            };
            reader.readAsText(file);
        }
        // Reset file input to allow loading the same file again
        event.target.value = null;
    });

    functionKeyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;
            handleFunctionKey(action);
        });
    });

    // --- Function Key Actions ---
    function handleFunctionKey(action) {
        switch (action) {
            case 'help':
                alert('DisplayWrite Simulator Help:\n\nF2: Save current text to a .txt file.\nF3: Load a .txt file into the editor.\n\nOther functions are placeholders.');
                break;
            case 'save':
                saveFile();
                break;
            case 'load':
                fileInput.click(); // Trigger hidden file input
                break;
            case 'block':
            case 'goto':
            case 'search':
            case 'format':
            case 'options':
            case 'spell':
                alert(`Function ${action.toUpperCase()} (e.g., F4) is not yet implemented.`);
                break;
            case 'exit':
                if (confirm('Are you sure you want to exit? Unsaved changes will be lost.')) {
                    // In a real app, you might close the window or redirect.
                    // For this simulator, we can clear the editor or just inform.
                    editor.value = "// Editor 'exited'. Refresh page to restart.";
                    alert('Exited. Content cleared (simulated).');
                    currentFileName = 'untitled.txt';
                    updateStatusBar();
                }
                break;
            default:
                console.warn('Unknown function key action:', action);
        }
    }

    function saveFile() {
        const textToSave = editor.value;
        const blob = new Blob([textToSave], { type: 'text/plain' });
        const a = document.createElement('a');
        a.download = currentFileName;
        a.href = URL.createObjectURL(blob);
        a.style.display = 'none'; // Hide the link
        document.body.appendChild(a); // Append to body to make it clickable
        a.click();
        document.body.removeChild(a); // Clean up
        URL.revokeObjectURL(a.href); // Release object URL
        alert(`File saved as ${currentFileName}`);
    }

    // --- Initialization ---
    generateRuler();
    updateStatusBar();
    editor.focus();
});

// Capture actual F-key presses (can be tricky as browsers use them)
document.addEventListener('keydown', (event) => {
    // Check if the focus is NOT on an input field or textarea to avoid conflicts,
    // though here we WANT it for the editor sometimes.
    // For simplicity, we'll let function key buttons be the primary interface.
    // This is more for advanced users who know F-keys often work.

    const fKeyMapping = {
        'F1': 'help', 'F2': 'save', 'F3': 'load', 'F4': 'block',
        'F5': 'goto', 'F6': 'search', 'F7': 'format', 'F8': 'options',
        'F9': 'spell', 'F10': 'exit'
    };

    if (fKeyMapping[event.key]) {
        // Only prevent default if we're handling it and it's not in an input where F-keys might be useful
        // For editor, many F-keys are overridden by browser. Best to use buttons.
        // However, if we wanted to *try* and capture them:
        // event.preventDefault();
        // handleFunctionKey(fKeyMapping[event.key]);
        // console.log(`Physical ${event.key} pressed. Mapped to: ${fKeyMapping[event.key]}`);
    }
});