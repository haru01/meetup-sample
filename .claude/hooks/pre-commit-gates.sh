#!/bin/bash
# PreToolUse hook: git commit 前に quality gates を実行
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# git commit コマンドのみ対象
if [[ ! "$COMMAND" =~ ^git\ commit ]]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR/backend" || exit 0

# テスト実行
TEST_OUTPUT=$(npx vitest run 2>&1)
if [ $? -ne 0 ]; then
  echo '{"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": "テストが失敗しています。commit 前に修正してください。"}}'
  exit 0
fi

# lint チェック
LINT_OUTPUT=$(npx eslint src 2>&1)
if [ $? -ne 0 ]; then
  echo '{"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": "lint エラーがあります。commit 前に修正してください。"}}'
  exit 0
fi

# dependency-cruiser チェック
if [ -f ".dependency-cruiser.cjs" ]; then
  DEP_OUTPUT=$(npx dependency-cruiser --config .dependency-cruiser.cjs --output-type json src/ 2>&1)
  VIOLATIONS=$(echo "$DEP_OUTPUT" | jq -r '.summary.error // 0' 2>/dev/null)
  if [ "$VIOLATIONS" != "0" ] && [ -n "$VIOLATIONS" ]; then
    echo '{"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": "依存関係ルール違反があります。commit 前に修正してください。"}}'
    exit 0
  fi
fi

exit 0
