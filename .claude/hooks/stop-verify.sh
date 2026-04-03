#!/bin/bash
# Stop hook: 作業完了前にテストと lint が通ることを確認
cd "$CLAUDE_PROJECT_DIR/backend" || exit 0

ERRORS=""

# テスト実行
TEST_OUTPUT=$(npx vitest run 2>&1)
if [ $? -ne 0 ]; then
  ERRORS="$ERRORS\n- バックエンドテストが失敗しています"
fi

# lint チェック
LINT_OUTPUT=$(npx eslint src 2>&1)
if [ $? -ne 0 ]; then
  ERRORS="$ERRORS\n- バックエンド lint エラーがあります"
fi

# フロントエンドテスト
cd "$CLAUDE_PROJECT_DIR/frontend" 2>/dev/null
if [ $? -eq 0 ]; then
  FTEST_OUTPUT=$(npx vitest run 2>&1)
  if [ $? -ne 0 ]; then
    ERRORS="$ERRORS\n- フロントエンドテストが失敗しています"
  fi

  FLINT_OUTPUT=$(npx eslint src 2>&1)
  if [ $? -ne 0 ]; then
    ERRORS="$ERRORS\n- フロントエンド lint エラーがあります"
  fi
fi

if [ -n "$ERRORS" ]; then
  REASON=$(echo -e "Quality Gates 未達:$ERRORS")
  echo "{\"decision\": \"block\", \"reason\": \"$REASON\"}"
  exit 0
fi

exit 0
