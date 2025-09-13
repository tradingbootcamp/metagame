'use server'

import { locationsService } from '@/lib/db/locations'

export const getAllLocations = locationsService.getAllLocations
export const getOrderedScheduleLocations =
  locationsService.getOrderedScheduleLocations

export const getAllMegagameLocations = locationsService.getAllMegagameLocations
