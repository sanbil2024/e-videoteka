import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock component to avoid actual API calls during testing
jest.mock('../pages/HomePage', () => {
  return function MockHomePage() {
    return <div data-testid="mock-homepage">Mock Home Page</div>;
  };
});

test('renders E-Videoteka header', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const headerElement = screen.getByText(/E-Videoteka/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders footer with author information', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const authorElement = screen.getByText(/Autor: Sandro Bilandžić/i);
  expect(authorElement).toBeInTheDocument();
});

test('renders navigation links', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const homeLink = screen.getByText(/Početna/i);
  const cartLink = screen.getByText(/Košarica/i);
  const loginLink = screen.getByText(/Prijava/i);
  
  expect(homeLink).toBeInTheDocument();
  expect(cartLink).toBeInTheDocument();
  expect(loginLink).toBeInTheDocument();
});
