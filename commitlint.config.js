module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    "type-enum": [2, "always", ["feat", "fix", "revert"]],
    "subject-max-length": [1, "always", 30],
  },
};
// type-enum 是指 commit 正文的前缀，通常我们会用到这三种：

// Feat：一个新的功能；
// Fix： 一次修复，之前已有问题的修复；
// Revert：一次回滚，书写异常代码后的撤销。
// subject-max-length 则对应实际的 commit 长度（不包括前缀），这里我们设置为30

