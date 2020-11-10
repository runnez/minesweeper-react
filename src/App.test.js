import { render, screen } from '@testing-library/react';
import App from './App';

test('renders settings', () => {
  render(<App />);
  expect(screen.getByText(/react minesweeper/i)).toBeInTheDocument();
  expect(screen.getByText(/Play/i)).toBeInTheDocument();
});

test('renders game', () => {
  render(<App />);
  screen.getByText(/Play/i).click();
  expect(screen.getByText(/🙂/i)).toBeInTheDocument();
});
