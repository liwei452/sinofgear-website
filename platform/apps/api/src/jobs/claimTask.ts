import type { SqliteAiTaskRepository } from './taskRepository.js'

export async function claimTask(repository: SqliteAiTaskRepository, taskId: string, now = new Date()) {
  return repository.claim(taskId, now)
}

export async function claimNextTask(repository: SqliteAiTaskRepository, now = new Date()) {
  const taskId = await repository.findNextRunnableId(now)
  return taskId ? repository.claim(taskId, now) : null
}
