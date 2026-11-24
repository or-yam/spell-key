import Foundation
import AppKit

struct SpellCheckResult: Encodable {
    enum Status: String, Encodable {
        case correct
        case misspelled
        case invalidSelection = "invalid-selection"
    }

    let status: Status
    var suggestions: [String] = []
}

func checkSpelling(in selection: String) -> SpellCheckResult {
    // Allow punctuation around the word and apostrophes or hyphens inside it.
    let pattern = #"\A[\p{P}\s]*(\p{L}[\p{L}\p{M}]*(?:['’‐‑-]\p{L}[\p{L}\p{M}]*)*)[\p{P}\s]*\z"#
    let expression = try! NSRegularExpression(pattern: pattern)
    let text = selection as NSString

    guard let match = expression.firstMatch(in: selection, range: NSRange(location: 0, length: text.length)) else {
        return SpellCheckResult(status: .invalidSelection)
    }

    let wordRange = match.range(at: 1)
    let word = text.substring(with: wordRange)
    let checker = NSSpellChecker.shared
    let language = "en_US"
    let misspelling = checker.checkSpelling(of: word,
                                           startingAt: 0,
                                           language: language,
                                           wrap: false,
                                           inSpellDocumentWithTag: 0,
                                           wordCount: nil)

    guard misspelling.length > 0 else {
        return SpellCheckResult(status: .correct)
    }

    let guesses = checker.guesses(forWordRange: misspelling,
                                  in: word,
                                  language: language,
                                  inSpellDocumentWithTag: 0) ?? []
    let replacementRange = NSRange(location: wordRange.location + misspelling.location,
                                   length: misspelling.length)
    var seen = Set([selection])
    let replacements = guesses
        .map { text.replacingCharacters(in: replacementRange, with: $0) }
        .filter { seen.insert($0).inserted }
    return SpellCheckResult(status: .misspelled, suggestions: replacements)
}

guard CommandLine.arguments.count == 2 else {
    fputs("Usage: spellcheck <selection>\n", stderr)
    exit(1)
}

let selection = CommandLine.arguments[1]
guard !selection.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
    fputs("Error: Empty selection provided\n", stderr)
    exit(2)
}

do {
    let result = checkSpelling(in: selection)
    let json = try JSONEncoder().encode(result)
    print(String(decoding: json, as: UTF8.self))
} catch {
    fputs("Error: Could not encode spelling results\n", stderr)
    exit(3)
}
