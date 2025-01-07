import * as vscode from 'vscode';
import { MECMLogEntry } from './types';
import { generateWebviewContent } from './webview/template';

class MECMLogDocument implements vscode.CustomDocument {
    private logEntries: MECMLogEntry[] = [];
    private sources: Set<string> = new Set();

    private constructor(
        public readonly uri: vscode.Uri
    ) {}

    static async create(uri: vscode.Uri, otherUris: vscode.Uri[] = []): Promise<MECMLogDocument> {
        const document = new MECMLogDocument(uri);
        await document.loadFiles([uri, ...otherUris]);
        return document;
    }

    async loadFiles(uris: vscode.Uri[]) {
        for (const uri of uris) {
            try {
                const content = await vscode.workspace.fs.readFile(uri);
                const text = new TextDecoder().decode(content);
                const entries = parseLogFile(text).map(entry => ({
                    ...entry,
                    source: uri.fsPath.split('/').pop() || uri.fsPath // Get filename
                }));
                this.logEntries.push(...entries);
                this.sources.add(uri.fsPath);
            } catch (error) {
                console.error(`Error loading file ${uri.fsPath}:`, error);
            }
        }
        // Sort all entries by timestamp
        this.logEntries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }

    getEntries(): MECMLogEntry[] {
        return this.logEntries;
    }

    getSources(): string[] {
        return Array.from(this.sources);
    }

    dispose(): void {}
}

function getWebviewContent(entries: MECMLogEntry[]): string {
    return generateWebviewContent(entries);
}

class MECMLogPreviewProvider implements vscode.CustomEditorProvider<MECMLogDocument> {
    public static readonly viewType = 'mecm-log-parser.preview';
    
    private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<vscode.CustomDocumentEditEvent<MECMLogDocument>>();
    public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        return vscode.window.registerCustomEditorProvider(
            MECMLogPreviewProvider.viewType,
            new MECMLogPreviewProvider(context),
            {
                supportsMultipleEditorsPerDocument: false,
                webviewOptions: {
                    retainContextWhenHidden: true,
                }
            }
        );
    }

    constructor(private readonly context: vscode.ExtensionContext) {}

    async openCustomDocument(
        uri: vscode.Uri,
        openContext: vscode.CustomDocumentOpenContext,
        token: vscode.CancellationToken
    ): Promise<MECMLogDocument> {
        return MECMLogDocument.create(uri);
    }

    async resolveCustomEditor(
        document: MECMLogDocument,
        webviewPanel: vscode.WebviewPanel,
        token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.html = getWebviewContent(document.getEntries());
    }

    // Required implementations for CustomEditorProvider
    async saveCustomDocument(document: MECMLogDocument, cancellation: vscode.CancellationToken): Promise<void> {
        // Read-only, no save needed
    }

    async saveCustomDocumentAs(document: MECMLogDocument, destination: vscode.Uri, cancellation: vscode.CancellationToken): Promise<void> {
        // Read-only, no save needed
    }

    async revertCustomDocument(document: MECMLogDocument, cancellation: vscode.CancellationToken): Promise<void> {
        // Read-only, no revert needed
    }

    async backupCustomDocument(document: MECMLogDocument, context: vscode.CustomDocumentBackupContext, cancellation: vscode.CancellationToken): Promise<vscode.CustomDocumentBackup> {
        return {
            id: document.uri.toString(),
            delete: () => { /* Nothing to delete */ }
        };
    }
}

async function openLogFilesInFolder(folderPath: string) {
    try {
        console.log(`Attempting to open log files in folder: ${folderPath}`);
        const pattern = new vscode.RelativePattern(folderPath, '*.log');
        const files = await vscode.workspace.findFiles(pattern);
        console.log(`Found ${files.length} log files`);
        
        if (files.length === 0) {
            vscode.window.showInformationMessage('No log files found in the selected folder.');
            return;
        }

        // Create and show the custom editor with combined logs
        const mainUri = files[0]; // Use the first file as the main document URI
        const otherUris = files.slice(1);
        const document = await MECMLogDocument.create(mainUri, otherUris);
        const panel = vscode.window.createWebviewPanel(
            MECMLogPreviewProvider.viewType,
            'Combined MECM Logs',
            vscode.ViewColumn.Active,
            { enableScripts: true }
        );
        
        panel.webview.html = getWebviewContent(document.getEntries());
        
    } catch (error) {
        console.error('Error opening log files:', error);
        vscode.window.showErrorMessage('Failed to open log files in the folder');
    }
}

function parseLogFile(content: string): MECMLogEntry[] {
    const entries: MECMLogEntry[] = [];
    const lines = content.split('\n');
    const logEntryRegex = /<!\[LOG\[(.*?)\]LOG\]!><time="(.*?)" date="(.*?)" component="(.*?)" context="(.*?)" type="(.*?)" thread="(.*?)" file=".*?">/;

    for (const line of lines) {
        const match = line.match(logEntryRegex);
        if (match) {
            entries.push({
                message: match[1],
                timestamp: `${match[3]} ${match[2]}`,
                component: match[4],
                type: getLogType(match[6]),
                thread: match[7],
                source: ''  // Will be set when loading the file
            });
        }
    }
    return entries;
}

function getLogType(type: string): string {
    const types: { [key: string]: string } = {
        '1': 'Info',
        '2': 'Warning',
        '3': 'Error'
    };
    return types[type] || 'Unknown';
}

function imECMLogsFolder(path: string): boolean {
    const normalizedPath = path.replace(/\\/g, '/').toLowerCase();
    return normalizedPath.includes('/ccm/logs');
}

export function activate(context: vscode.ExtensionContext) {
    console.log('MECM Log Parser is now active');

    // Register the custom editor provider
    context.subscriptions.push(MECMLogPreviewProvider.register(context));

    // Watch for workspace folder changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeWorkspaceFolders(async (event) => {
            console.log('Workspace folders changed');
            for (const folder of event.added) {
                const folderPath = folder.uri.fsPath;
                console.log(`Checking added folder: ${folderPath}`);
                if (imECMLogsFolder(folderPath)) {
                    console.log('Found CCM Logs folder, opening files...');
                    await openLogFilesInFolder(folderPath);
                }
            }
        })
    );

    // Check existing workspace folders when extension activates
    if (vscode.workspace.workspaceFolders) {
        console.log('Checking existing workspace folders');
        for (const folder of vscode.workspace.workspaceFolders) {
            const folderPath = folder.uri.fsPath;
            console.log(`Checking workspace folder: ${folderPath}`);
            if (imECMLogsFolder(folderPath)) {
                console.log('Found CCM Logs folder, opening files...');
                openLogFilesInFolder(folderPath);
            }
        }
    }

    // Add command to manually open log files in a folder
    let openLogsCommand = vscode.commands.registerCommand('mecm-log-parser.openLogsInFolder', async (uri?: vscode.Uri) => {
        let folderUri: vscode.Uri | undefined;
        
        if (uri) {
            folderUri = uri;
        } else {
            // If no URI provided, ask user to select a folder
            const folders = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                title: 'Select CCM Logs Folder'
            });
            
            if (folders && folders.length > 0) {
                folderUri = folders[0];
            }
        }

        if (folderUri) {
            await openLogFilesInFolder(folderUri.fsPath);
        }
    });

    context.subscriptions.push(openLogsCommand);

    // Register the original command handler for manual triggering
    let disposable = vscode.commands.registerCommand('mecm-log-parser.parseMECMLog', async (uri?: vscode.Uri) => {
        let targetUri: vscode.Uri | undefined;
        
        if (uri) {
            // Called from context menu
            targetUri = uri;
        } else {
            // Called from command palette or other
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                vscode.window.showErrorMessage('No file selected');
                return;
            }
            targetUri = activeEditor.document.uri;
        }

        try {
            const content = await vscode.workspace.fs.readFile(targetUri);
            const text = new TextDecoder().decode(content);
            const logEntries = parseLogFile(text);
            
            const panel = vscode.window.createWebviewPanel(
                'mecmLogView',
                'MECM Log Viewer',
                vscode.ViewColumn.Beside,
                {
                    enableScripts: true
                }
            );

            panel.webview.html = getWebviewContent(logEntries);

            // Handle messages from the webview
            panel.webview.onDidReceiveMessage(
                message => {
                    switch (message.command) {
                        case 'alert':
                            vscode.window.showInformationMessage(message.text);
                            return;
                    }
                },
                undefined,
                context.subscriptions
            );
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to parse log file: ${error}`);
        }
    });

    context.subscriptions.push(disposable);
}

async function parseAndDisplayLog(editor: vscode.TextEditor, context: vscode.ExtensionContext) {
    try {
        const document = editor.document;
        const text = document.getText();
        const logEntries = parseLogFile(text);
        
        const panel = vscode.window.createWebviewPanel(
            'mecmLogView',
            'MECM Log Viewer',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true
            }
        );

        panel.webview.html = getWebviewContent(logEntries);

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'alert':
                        vscode.window.showInformationMessage(message.text);
                        return;
                }
            },
            undefined,
            context.subscriptions
        );
    } catch (error) {
        vscode.window.showErrorMessage(`Error parsing log: ${error}`);
    }
}

export function deactivate() {}