import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterToday',
  pure: true,
  standalone: true,
})
export class FilterTodayPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(items: any[], today: boolean): any {
    return items.filter(it => it.today === today);
  }
}

@Pipe({
  name: 'notiAvatar',
  pure: true,
  standalone: true,
})
export class AvatarNotificationPipe implements PipeTransform {
  transform(actorName: string): string {
    if (actorName) {
      const [firstName, lastName] = actorName.split(' ');

      return `${firstName ? firstName[0] : ''}${lastName ? lastName[0] : ''}`;
    }
    return '';
  }
}
