/**
 * @file
 * @date 2022-10-05
 * @author xuejie.he
 * @lastModify xuejie.he 2022-10-05
 */

/**
 * 判断是否传进来的show有值
 * 有值 就是想要自己控制
 * 这时候不做组件的交互
 */
export const isCustom = (value: boolean | undefined): boolean => typeof value === "boolean";
