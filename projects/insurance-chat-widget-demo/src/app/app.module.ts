import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { InsuranceChatWidgetModule } from '../../../insurance-chat-widget/src/lib/insurance-chat-widget.module';
import { WidgetConfigService } from '../../../insurance-chat-widget/src/lib/services/widget-config.service';
import { WidgetConfig } from '../../../insurance-chat-widget/src/lib/models/widget-config.model';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    InsuranceChatWidgetModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private configService: WidgetConfigService) {
    // Initialize widget with demo configuration
    // Connect to demo backend server on port 3000
    const demoConfig: WidgetConfig = {
      jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vLXVzZXIiLCJ0ZW5hbnRJZCI6ImRlbW8tdGVuYW50IiwiYXBwbGljYXRpb25JZCI6IkRFTU8tMDAxIiwiaWF0IjoxNzEwMDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9.demo-signature', // Valid JWT format for demo
      tenantId: 'demo-tenant',
      applicationId: 'DEMO-001',
      environment: 'dev',
      apiBaseUrl: 'http://localhost:3000', // Demo backend server
      locale: 'en-GB',
      theme: {
        palette: {
          primary: '#0D47A1',
          secondary: '#1976D2',
        },
        density: 'comfortable',
      },
      features: {
        voice: true,
        showProgress: true,
        allowBackNav: false,
      },
      analytics: (event: unknown) => {
        console.log('Analytics Event:', event);
      },
    };

    this.configService.init(demoConfig);
  }
}

