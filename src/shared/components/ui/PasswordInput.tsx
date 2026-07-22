import { useState } from 'react';
import { Input, type InputProps } from './Input';
import { Button } from './Button';

export type PasswordInputProps = Omit<InputProps, 'type'>;

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input">
      <Input {...props} type={visible ? 'text' : 'password'} />
      <Button type="button" variant="ghost" onClick={() => setVisible((value) => !value)}>
        {visible ? 'Hide' : 'Show'}
      </Button>
    </div>
  );
}
