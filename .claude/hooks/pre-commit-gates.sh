#!/bin/bash
# PreToolUse hook: git commit 前に quality gates を実行 (docker-dev.sh 経由)
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# git commit コマンドのみ対象
if [[ ! "$COMMAND" =~ ^git\ commit ]]; then
  exit 0
fi

SCRIPT="$CLAUDE_PROJECT_DIR/scripts/docker-dev.sh"

# docker-dev.sh 存在チェック
if [ ! -x "$SCRIPT" ]; then
  echo '{"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": "scripts/docker-dev.sh が見つかりません。"}}'
  exit 0
fi

# バックエンドテスト
"$SCRIPT" bash -c "cd backend && npx vitest run" 2>&1 >/dev/null
if [ $? -ne 0 ]; then
  echo '{"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": "バックエンドテストが失敗しています。commit 前に修正してください。"}}'
  exit 0
fi

# バックエンド lint
"$SCRIPT" bash -c "cd backend && npx eslint src" 2>&1 >/dev/null
if [ $? -ne 0 ]; then
  echo '{"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": "バックエンド lint エラーがあります。commit 前に修正してください。"}}'
  exit 0
fi

# フロントエンドテスト
"$SCRIPT" bash -c "cd frontend && npx vitest run" 2>&1 >/dev/null
if [ $? -ne 0 ]; then
  echo '{"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": "フロントエンドテストが失敗しています。commit 前に修正してください。"}}'
  exit 0
fi

# フロントエンド lint
"$SCRIPT" bash -c "cd frontend && npx eslint src" 2>&1 >/dev/null
if [ $? -ne 0 ]; then
  echo '{"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": "フロントエンド lint エラーがあります。commit 前に修正してください。"}}'
  exit 0
fi

exit 0
