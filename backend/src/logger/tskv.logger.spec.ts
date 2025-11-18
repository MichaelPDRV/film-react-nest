import { TskvLogger } from './tskv.logger';

describe('TskvLogger', () => {
  let logger: TskvLogger;
  let spy: jest.SpyInstance;
  // Перед каждым тестом создаем новый экземпляр логгера и шпионим за console.log
  beforeEach(() => {
    logger = new TskvLogger();
    spy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it('produces tskv line containing level and message', () => {
    logger.log('ok', 'CTX');
    expect(spy).toHaveBeenCalled(); // проверяем, что log вызван
    const out = spy.mock.calls[0][0] as string;
    expect(out).toContain('level=log');
    expect(out).toContain('message=ok');
    expect(out).toContain('context=CTX');
  });

  it('escapes tabs, newlines and equals in message', () => {
    const message = 'Hello\tWorld\nTest=Escape';
    logger.log(message);
    const out = spy.mock.calls[0][0] as string;
    expect(out).toContain('message=Hello\\tWorld\\nTest\\=Escape');
  });
});
