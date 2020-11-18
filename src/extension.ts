import * as vscode from 'vscode';
import { getColors, parseColor } from './utils';
const closestvector = require('closestvector');

export async function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "color-names" is now active!');
    const colors = await getColors();
    const closest = new closestvector(colors.map((c) => [c.rgb.r, c.rgb.g, c.rgb.b]));
    console.log('"color-names" get data ready');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('color-names.generateColorNames', async () => {
        // The code you place here will be executed every time your command is executed
        const text = await vscode.env.clipboard.readText();
        try {
            const nearestColor = closest.get(parseColor(text));
            const result = colors[nearestColor['index']].name;
            vscode.env.clipboard.writeText(result);
            vscode.window.showTextDocument;
            vscode.window.showInformationMessage(`The ColorName ${result} is copied!`);
        } catch (error) {
            vscode.window.showErrorMessage(`clipbord data ${text.slice(0, 10)}... isn\'t valid color`, 'feedback');
        }
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
