export const TAG_REGEX = new RegExp(/^[#][^\s]+$/);

/**
 * Matches a number of at least 1 character e.g. '0'
 */
export const NUMBER_REGEX = new RegExp(/^\d+$/);

export const TAGS_REGEX = new RegExp(/#[^ \t]+/g);

//A measurement in pixels
//e.g. 10px
export const CSS_MEASUREMENT_PIXEL_REGEX = new RegExp(/^([1-9])([0-9]*)px$/);

/**
 * Matches a date with the format yyyy/mm/dd
 */
export const DATE_REGEX = new RegExp(/^\d{4}\/\d{2}\/\d{2}$/);

/**
 * Matches a markdown checkbox
 * [ ] or [x]
 */
export const CHECKBOX_REGEX = new RegExp(/^\[[x ]{0,1}\]$/);

/**
 * Matches a checked markdown checkbox
 * [x]
 */
export const CHECKBOX_CHECKED_REGEX = new RegExp(/^\[[x]\]$/);

/**
 * Matches a forward or backslash
 * / or \
 */
export const SLASH_REGEX = new RegExp(/\/|\\/);

/**
 * Matches all internal links
 * [[File Name]]
 */
export const INTERNAL_LINK_REGEX = new RegExp(/\[\[[^\\\[\]]+\]\]/, "g");

/**
 * Matches an internal link alias
 * |alias
 */
export const INTERNAL_LINK_ALIAS_REGEX = new RegExp(/\|[^\n\r\]]+/);

/**
 * Matches all left square brackets
 * [
 */
export const LEFT_SQUARE_BRACKET_REGEX = new RegExp(/\[/, "g");

/**
 * Matches all right square brackets
 * ]
 */
export const RIGHT_SQUARE_BRACKET_REGEX = new RegExp(/\]/, "g");

/**
 * Matches all external links
 * e.g. https://www.google.com
 */
export const EXTERNAL_LINK_REGEX = new RegExp(/http[s]{0,1}:\/\/[^\s]+/, "g");

/**
 * Matches all unescaped pipes
 * k|
 */
export const UNESCAPED_PIPE_REGEX = new RegExp(/[^\\]\|/, "g");

/**
 * Matches a table id
 * table-id-123456
 */
export const TABLE_ID_REGEX = new RegExp(/^table-id-[a-zA-Z0-9_-]+$/);

/**
 * Matches a row id
 * row-id-123456
 */
export const ROW_ID_REGEX = new RegExp(/^row-id-[a-zA-Z0-9_-]+$/);

/**
 * Matches a column id
 * column-id-123456
 */
export const COLUMN_ID_REGEX = new RegExp(/^column-id-[a-zA-Z0-9_-]+$/);
