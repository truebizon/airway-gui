import stylistic from '@stylistic/eslint-plugin'
import withNuxt from './.nuxt/eslint.config.mjs'

/**
 * https://qiita.com/yuki_s_14/items/96620ccfb1dd897ce9f3
 * 内部的には @typescript-eslint と vue/vue3-recommended が extendsされている
 */
export default withNuxt(
  {
    files: ['**/*.vue', '**/*.ts'],
    rules: {
      // off
      '@typescript-eslint/no-explicit-any': 'off',
      // warn
      'no-console': 'warn',
      'eqeqeq': 'warn',
      'default-param-last': 'warn',
      'no-constant-condition': 'warn',
      // error
      'no-cond-assign': 'error',
      'no-dupe-else-if': 'error',
    },
  },
  {
    files: ['**/*.vue'],
    rules: {
      // off
      'vue/multi-word-component-names': 'off',
      // warn
      // error
      'vue/no-multiple-template-root': 'error',
      'vue/require-v-for-key': 'error',
      'vue/no-use-v-if-with-v-for': 'error',
      // XSS対策。原則v-htmlタグは使わないこと
      'vue/no-v-html': 'error',
    },
  },
  stylistic.configs.customize({
    indent: 2, // インデントはスペース2
    quotes: 'single', // クオートはシングル
    semi: false, // セミコロンは不要
  }),
)
