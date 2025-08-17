import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import AppModal from '../src/components/Modal';

describe('AppModal', () => {
  it('renders title and message when visible', () => {
    render(
      <AppModal
        visible
        title="Test Title"
        message="Hello world"
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('Test Title')).toBeTruthy();
    expect(screen.getByText('Hello world')).toBeTruthy();
  });

  it('fires primary action', () => {
    const onPrimary = jest.fn();
    render(
      <AppModal
        visible
        title="Actions"
        primaryAction={{ label: 'Confirm', onPress: onPrimary }}
      />
    );

    fireEvent.press(screen.getByText('Confirm'));
    expect(onPrimary).toHaveBeenCalled();
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(
      <AppModal
        visible={false}
        title="Hidden"
        message="Should not show"
      />
    );

    expect(queryByText('Hidden')).toBeNull();
    expect(queryByText('Should not show')).toBeNull();
  });
});

