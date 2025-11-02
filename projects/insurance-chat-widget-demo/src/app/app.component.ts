import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ChatWidgetShellComponent } from '../../../insurance-chat-widget/src/lib/components/chat-widget-shell/chat-widget-shell.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  title = 'Insurance Chat Widget Demo';
  
  @ViewChild(ChatWidgetShellComponent) widgetShell?: ChatWidgetShellComponent;

  ngAfterViewInit(): void {
    // Auto-expand the widget for demo purposes after a short delay
    setTimeout(() => {
      if (this.widgetShell) {
        this.widgetShell.expand();
      }
    }, 200); // Delay to ensure component is fully initialized
  }
}

