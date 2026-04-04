#!/bin/bash
# PostToolUse hook: Edit/Write 後にバックエンドの型チェックを実行
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.file // empty')

# バックエンドファイルのみ対象
if [[ "$FILE" != *"backend/"* ]]; then
  exit 0
fi

SCRIPT="$CLAUDE_PROJECT_DIR/scripts/docker-dev.sh"
if [ ! -x "$SCRIPT" ]; then
  exit 0
fi

OUTPUT=$("$SCRIPT" bash -c "cd backend && npx tsc --noEmit" 2>&1 | head -20)
if echo "$OUTPUT" | grep -q "error TS"; then
  echo "型チェックエラー:"
  echo "$OUTPUT"
fi

exit 0
