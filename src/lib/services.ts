import { Service, ServiceGroup } from './types';
import { uid } from './utils';

const GROUPS_KEY = (userId: string) => `bp_service_groups_${userId}`;
const LEGACY_KEY = (userId: string) => `bp_services_${userId}`;

export function saveServiceGroups(userId: string, groups: ServiceGroup[]) {
  localStorage.setItem(GROUPS_KEY(userId), JSON.stringify(groups));
}

export function loadServiceGroups(userId: string): ServiceGroup[] {
  const storedGroups = JSON.parse(localStorage.getItem(GROUPS_KEY(userId)) || '[]') as ServiceGroup[];
  if (storedGroups.length > 0) return normalizeGroups(storedGroups);

  const legacyServices = JSON.parse(localStorage.getItem(LEGACY_KEY(userId)) || '[]') as Service[];
  if (legacyServices.length === 0) return [];

  const migrated = migrateLegacyServices(legacyServices);
  saveServiceGroups(userId, migrated);
  return migrated;
}

export function flattenServiceGroups(groups: ServiceGroup[]): Service[] {
  return groups.flatMap(group =>
    group.services.map(service => ({
      ...service,
      groupId: group.id,
      groupName: group.name,
    }))
  );
}

function normalizeGroups(groups: ServiceGroup[]): ServiceGroup[] {
  return groups.map(group => ({
    ...group,
    services: (group.services || []).map(service => ({
      ...service,
      type: service.type || 'service',
      priceMode: service.priceMode || 'fixed',
      groupId: group.id,
      groupName: group.name,
    })),
  }));
}

function migrateLegacyServices(services: Service[]): ServiceGroup[] {
  const regular = services.filter(service => service.type !== 'combo');
  const combos = services.filter(service => service.type === 'combo');
  const groups: ServiceGroup[] = [];

  if (regular.length > 0) {
    const id = uid();
    groups.push({
      id,
      name: 'Dịch vụ đơn lẻ',
      desc: 'Các dịch vụ đang bán riêng.',
      services: regular.map(service => ({ ...service, type: 'service', groupId: id, groupName: 'Dịch vụ đơn lẻ' })),
    });
  }

  if (combos.length > 0) {
    const id = uid();
    groups.push({
      id,
      name: 'Combo & Gói ưu đãi',
      desc: 'Các gói/combo đã tạo trước đây.',
      services: combos.map(service => ({ ...service, groupId: id, groupName: 'Combo & Gói ưu đãi' })),
    });
  }

  return groups;
}
