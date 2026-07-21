import type { AppDatabase } from './database.js'

interface Migration {
  version: number
  sql: string
}

const migrations: Migration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        system_role TEXT NOT NULL DEFAULT 'MEMBER',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      CREATE INDEX sessions_user_id_idx ON sessions(user_id);
      CREATE INDEX sessions_expires_at_idx ON sessions(expires_at);

      CREATE TABLE factory_projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        legal_name TEXT NOT NULL,
        primary_contact_name TEXT NOT NULL,
        primary_contact_email TEXT NOT NULL,
        export_stage TEXT NOT NULL,
        existing_acquisition_channels TEXT NOT NULL,
        stage TEXT NOT NULL DEFAULT 'PROFILE',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE project_memberships (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES factory_projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (project_id, user_id)
      );
      CREATE INDEX project_memberships_project_id_idx ON project_memberships(project_id);
      CREATE INDEX project_memberships_user_id_idx ON project_memberships(user_id);

      CREATE TABLE file_assets (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        logical_name TEXT NOT NULL,
        filename TEXT NOT NULL,
        version INTEGER NOT NULL,
        storage_key TEXT NOT NULL UNIQUE,
        content_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        checksum TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'UPLOADED',
        uploaded_by_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES factory_projects(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by_id) REFERENCES users(id),
        UNIQUE (project_id, logical_name, version)
      );
      CREATE INDEX file_assets_project_id_idx ON file_assets(project_id);
      CREATE INDEX file_assets_checksum_idx ON file_assets(checksum);

      CREATE TABLE ai_tasks (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        source_file_id TEXT NOT NULL,
        source_file_version INTEGER NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'QUEUED',
        attempts INTEGER NOT NULL DEFAULT 0,
        prompt_version TEXT NOT NULL,
        model TEXT,
        output_json TEXT,
        error_code TEXT,
        token_usage_json TEXT,
        next_attempt_at TEXT,
        started_at TEXT,
        finished_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES factory_projects(id) ON DELETE CASCADE,
        FOREIGN KEY (source_file_id) REFERENCES file_assets(id) ON DELETE CASCADE,
        UNIQUE (type, source_file_id, source_file_version, prompt_version)
      );
      CREATE INDEX ai_tasks_project_id_idx ON ai_tasks(project_id);
      CREATE INDEX ai_tasks_status_next_attempt_idx ON ai_tasks(status, next_attempt_at);

      CREATE TABLE capabilities (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        source_file_id TEXT NOT NULL,
        source_task_id TEXT,
        revision INTEGER NOT NULL DEFAULT 1,
        supersedes_capability_id TEXT,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        value TEXT NOT NULL,
        evidence_quote TEXT NOT NULL,
        source_locator TEXT NOT NULL,
        confidence REAL NOT NULL,
        review_status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES factory_projects(id) ON DELETE CASCADE,
        FOREIGN KEY (source_file_id) REFERENCES file_assets(id) ON DELETE CASCADE,
        FOREIGN KEY (source_task_id) REFERENCES ai_tasks(id),
        FOREIGN KEY (supersedes_capability_id) REFERENCES capabilities(id)
      );
      CREATE INDEX capabilities_project_id_idx ON capabilities(project_id);
      CREATE INDEX capabilities_source_file_id_idx ON capabilities(source_file_id);
      CREATE INDEX capabilities_review_status_idx ON capabilities(review_status);

      CREATE TABLE capability_reviews (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        capability_id TEXT NOT NULL,
        reviewer_id TEXT NOT NULL,
        status TEXT NOT NULL,
        reason TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES factory_projects(id) ON DELETE CASCADE,
        FOREIGN KEY (capability_id) REFERENCES capabilities(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id)
      );
      CREATE INDEX capability_reviews_project_id_idx ON capability_reviews(project_id);
      CREATE INDEX capability_reviews_capability_id_idx ON capability_reviews(capability_id);

      CREATE TABLE market_candidates (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        product_focus TEXT NOT NULL,
        region TEXT NOT NULL,
        customer_type TEXT NOT NULL,
        rationale TEXT NOT NULL,
        capability_ids_json TEXT NOT NULL,
        uncertainties_json TEXT NOT NULL,
        questions_json TEXT NOT NULL,
        scores_json TEXT NOT NULL,
        verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED',
        status TEXT NOT NULL DEFAULT 'DRAFT',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES factory_projects(id) ON DELETE CASCADE
      );
      CREATE INDEX market_candidates_project_id_idx ON market_candidates(project_id);

      CREATE TABLE market_evidence (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        candidate_id TEXT NOT NULL,
        reviewer_id TEXT NOT NULL,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        source_type TEXT NOT NULL,
        published_at TEXT,
        summary TEXT NOT NULL,
        supports_or_challenges TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES factory_projects(id) ON DELETE CASCADE,
        FOREIGN KEY (candidate_id) REFERENCES market_candidates(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id)
      );
      CREATE INDEX market_evidence_project_id_idx ON market_evidence(project_id);
      CREATE INDEX market_evidence_candidate_id_idx ON market_evidence(candidate_id);

      CREATE TABLE market_decisions (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        primary_candidate_id TEXT NOT NULL,
        backup_candidate_id TEXT,
        reason TEXT NOT NULL,
        author_id TEXT NOT NULL,
        supersedes_decision_id TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES factory_projects(id) ON DELETE CASCADE,
        FOREIGN KEY (primary_candidate_id) REFERENCES market_candidates(id),
        FOREIGN KEY (backup_candidate_id) REFERENCES market_candidates(id),
        FOREIGN KEY (author_id) REFERENCES users(id),
        FOREIGN KEY (supersedes_decision_id) REFERENCES market_decisions(id)
      );
      CREATE INDEX market_decisions_project_id_idx ON market_decisions(project_id);

      CREATE TABLE audit_events (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        actor_id TEXT NOT NULL,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        changed_fields_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES factory_projects(id) ON DELETE CASCADE,
        FOREIGN KEY (actor_id) REFERENCES users(id)
      );
      CREATE INDEX audit_events_project_id_idx ON audit_events(project_id);
      CREATE INDEX audit_events_actor_id_idx ON audit_events(actor_id);
    `,
  },
  {
    version: 2,
    sql: `
      ALTER TABLE ai_tasks ADD COLUMN attempt_log_json TEXT NOT NULL DEFAULT '[]';
    `,
  },
]

export function runMigrations(database: AppDatabase) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `)
  const applied = database.prepare('SELECT 1 FROM schema_migrations WHERE version = ?')
  const record = database.prepare(
    'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)',
  )

  for (const migration of migrations) {
    if (applied.get(migration.version)) continue
    database.exec('BEGIN IMMEDIATE')
    try {
      database.exec(migration.sql)
      record.run(migration.version, new Date().toISOString())
      database.exec('COMMIT')
    } catch (error) {
      database.exec('ROLLBACK')
      throw error
    }
  }
}
