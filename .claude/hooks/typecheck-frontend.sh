#!/bin/bash
# PostToolUse hook: Edit/Write 後にフロントエンドの型チェックを実行
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.file // empty')

# フロントエンドファイルのみ対象
if [[ "$FILE" != *"frontend/"* ]]; then
  exit 0
fi

SCRIPT="$CLAUDE_PROJECT_DIR/scripts/docker-dev.sh"
if [ ! -x "$SCRIPT" ]; then
  exit 0
fi

OUTPUT=$("$SCRIPT" bash -c "cd frontend && npx tsc --noEmit" 2>&1 | head -20)
if echo "$OUTPUT" | grep -q "error TS"; then
  echo "型チェックエラー:"
  echo "$OUTPUT"
fi

exit 0
