import type { TaskOutputDto } from '@/types/api/data-contracts'

/**
 * Type guard to check if a TaskOutputDto is a regular task
 */
export function isTask(item: TaskOutputDto): item is TaskOutputDto & { type: 'task' } {
  return item.type === 'task'
}

/**
 * Type guard to check if a TaskOutputDto is an order appointment
 */
export function isOrderAppointment(
  item: TaskOutputDto
): item is TaskOutputDto & {
  type: 'order_appointment'
  orderId: number
  itemId?: number
  attendanceStatus?: 'UNKNOWN' | 'SHOWED' | 'NO_SHOW'
} {
  return item.type === 'order_appointment'
}

