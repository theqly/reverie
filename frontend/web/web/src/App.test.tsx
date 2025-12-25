import { describe, it, expect } from 'vitest';
import { render, screen } from './test/test-utils';
import App from './App';

describe('App', () => {
  it('рендерится без ошибок', () => {
    render(<App />);
    expect(document.querySelector('body')).toBeInTheDocument();
  });
});
