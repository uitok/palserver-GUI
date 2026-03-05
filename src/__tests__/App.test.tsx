import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import path from 'path';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import App from '../renderer/App';
import Translation from '../renderer/provider/Translation/Translation';
import { store } from '../renderer/redux/store';

beforeAll(() => {
  Object.defineProperty(window, 'electron', {
    configurable: true,
    value: {
      ipcRenderer: {
        sendMessage: jest.fn(),
        on: jest.fn(() => jest.fn()),
        once: jest.fn(),
        invoke: jest.fn(async () => []),
      },
      node: {
        __dirname: () => '',
        path: () => path,
      },
      constant: {
        APP_DATA_PATH: () => '',
        USER_SERVER_INSTANCES_PATH: () => '',
        ENGNIE_PATH: () => '',
        SERVER_ICONS_PATH: () => '',
        SYSTEM_PALGUARD_VERSION: () => 0,
        SERVER_PALGUARD_VERSION: () => 0,
        SYSTEM_UE4SS_VERSION: () => 0,
        SERVER_UE4SS_VERSION: () => 0,
      },
      openExplorer: jest.fn(),
      openLink: jest.fn(),
      alert: jest.fn(),
      selectFolder: jest.fn(async () => ''),
    },
  });
});

describe('App', () => {
  it('should render', () => {
    const queryClient = new QueryClient();
    expect(
      render(
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <Translation>
              <App />
            </Translation>
          </Provider>
        </QueryClientProvider>,
      ),
    ).toBeTruthy();
  });
});
