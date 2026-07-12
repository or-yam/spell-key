#!/bin/bash

set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd)"

swiftc -framework AppKit "$script_dir/spellcheck.swift" -o "$script_dir/../assets/spellcheck-native"
