export declare let foo: string;

declare function greet(greeting: string): void;

declare namespace myLib {
  function makeGreeting(s: string): string;

  let numberOfGreetings: number;
}

interface GreetingSettings {
  greeting: string;
  duration?: number;
  color?: string;
}

declare function greet(setting: GreetingSettings): void;

declare class Greeter {
  constructor(greeting: string);

  greeting: string;

  showGreeting(): void;
}
