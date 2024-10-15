/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.addColumns("admins", {
    verification_code: {
      type: "varchar(64)",
      nullable: true,
    },
    verification_code_expires_at: {
      type: "timestamp with time zone",
      nullable: true,
    },
    is_verified: {
      type: "boolean",
      default: false,
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropColumns("admins", [
    "verification_code",
    "verification_code_expires_at",
    "is_verified",
  ]);
};
