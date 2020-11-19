import * as vscode from 'vscode';
import { ColorEntity, getColors, parseColor } from './utils';
import * as fs from 'fs';
const closestvector = require('closestvector');

export async function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "color-names" is now active!');

    const fileUri = vscode.Uri.joinPath(context.globalStorageUri, 'colors.json');
    let colors: ColorEntity[] = [];
    let closest: { get: (arg0: [number, number, number]) => any };

    // if exists, use it before newest data resolved
    try {
        if (fs.existsSync(fileUri.path)) {
            const filecontent = Buffer.from(await vscode.workspace.fs.readFile(fileUri)).toString('utf8');
            colors = JSON.parse(filecontent);
        }
    } catch (error) {
        vscode.window.showErrorMessage(error.message);
    }

    if (colors.length === 0) {
        try {
            colors = await getColors();
            closest = new closestvector(colors.map((c) => [c.rgb.r, c.rgb.g, c.rgb.b]));
            vscode.workspace.fs.writeFile(fileUri, Buffer.from(JSON.stringify(colors)));
        } catch (error) {
            vscode.window.showErrorMessage(error.message);
        }
    } else {
        // not blocked
        getColors().then((result) => {
            colors = result;
            closest = new closestvector(colors.map((c) => [c.rgb.r, c.rgb.g, c.rgb.b]));
            vscode.workspace.fs.writeFile(fileUri, Buffer.from(JSON.stringify(colors)));
            console.log('"color-names" update data success!');
        });
    }

    console.log('"color-names" get data ready');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('color-names.generateColorNames', async () => {
        const text = await vscode.env.clipboard.readText();
        try {
            const nearestColor = closest.get(parseColor(text));
            const result = colors[nearestColor['index']].name;
            vscode.env.clipboard.writeText(result);
            vscode.window.showInformationMessage(`The ColorName # ${result} # is copied!`);
        } catch (error) {
            vscode.window
                .showErrorMessage(
                    `The text \`${
                        text.length > 7 ? text.slice(0, 6) + '...' : text
                    }\` on the clipboard is not a valid color value`,
                    'Feedback'
                )
                .then((selected) => {
                    if (selected === 'Feedback') {
                        vscode.commands.executeCommand('color-names.feedback');
                    }
                });
        }
    });

    context.subscriptions.push(disposable);

    vscode.commands.registerCommand('color-names.feedback', async () => {
        vscode.env.openExternal(vscode.Uri.parse('https://github.com/EliazTray/vscode-ext-color-names/issues'));
    });
}

// this method is called when your extension is deactivated
export function deactivate() {}
