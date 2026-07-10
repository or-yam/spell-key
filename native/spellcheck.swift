import Foundation
import AppKit

enum ExitCode {
    static let success: Int32 = 0
    static let noArguments: Int32 = 1
    static let emptyWord: Int32 = 2
}

let args = CommandLine.arguments
guard args.count > 1 else {
    fputs("Error: No word provided\n", stderr)
    fputs("Usage: spellcheck <word>\n", stderr)
    exit(ExitCode.noArguments)
}

let word = args[1].trimmingCharacters(in: .whitespacesAndNewlines)

guard !word.isEmpty else {
    fputs("Error: Empty word provided\n", stderr)
    exit(ExitCode.emptyWord)
}

let checker = NSSpellChecker.shared

if let guesses = checker.guesses(forWordRange: NSRange(location: 0, length: word.utf16.count),
                                 in: word,
                                 language: "en_US",
                                 inSpellDocumentWithTag: 0) {
    print(guesses.joined(separator: ", "))
    exit(ExitCode.success)
} else {
    print("")
    exit(ExitCode.success)
}
