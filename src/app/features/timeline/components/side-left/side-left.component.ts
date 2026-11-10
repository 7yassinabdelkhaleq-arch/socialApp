import { Component, EventEmitter, Input, Output } from '@angular/core';
export type SidebarSection = 'feed' | 'my-posts' | 'community' | 'saved';

@Component({
  selector: 'app-side-left',
  imports: [],
  templateUrl: './side-left.component.html',
  styleUrl: './side-left.component.css',
})
export class SideLeftComponent {
  @Input() activeSection: SidebarSection = 'feed';
  @Output() sectionChange = new EventEmitter<SidebarSection>();
  buttonClass(section: SidebarSection): string {
    const spacing = section === 'feed' ? '' : 'mt-1 ';
    const activeClasses =
      'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold transition bg-[#e7f3ff]! text-[#1877f2]!';
    const inactiveClasses =
      'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold transition text-slate-700! hover:bg-slate-100!';
    return spacing + (this.activeSection === section ? activeClasses : inactiveClasses);
  }
}
