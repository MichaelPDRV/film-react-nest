import { JsonLogger } from './json.logger';

describe('JsonLogger', () => {
  let logger: JsonLogger;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new JsonLogger();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('логируем сообщение в формате JSON', () => {
    logger.log('test message', 'param1');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('{"level":"log","timestamp":'),
    );
  });
});
