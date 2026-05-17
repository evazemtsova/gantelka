export function LogoFull() {
  return (
    <svg width="150" height="76" viewBox="0 0 150 76" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.9889 26.9398C12.9889 23.7672 10.417 21.1953 7.24445 21.1953C4.07188 21.1953 1.5 23.7672 1.5 26.9398L1.5 48.2763C1.5 51.4488 4.07188 54.0207 7.24445 54.0207C10.417 54.0207 12.9889 51.4488 12.9889 48.2763L12.9889 26.9398Z" fill="#D8FF3B" stroke="black" strokeWidth="3"/>
      <path d="M32.6844 17.913C32.6844 14.2872 29.7451 11.3479 26.1193 11.3479C22.4935 11.3479 19.5542 14.2872 19.5542 17.913L19.5542 57.3035C19.5542 60.9293 22.4935 63.8685 26.1193 63.8685C29.7451 63.8685 32.6844 60.9293 32.6844 57.3035V17.913Z" fill="#D8FF3B" stroke="black" strokeWidth="3"/>
      <path d="M54.0214 8.88596C54.0214 4.80694 50.7147 1.50024 46.6357 1.50024C42.5567 1.50024 39.25 4.80694 39.25 8.88596L39.25 66.3304C39.25 70.4094 42.5567 73.7161 46.6357 73.7161C50.7147 73.7161 54.0214 70.4094 54.0214 66.3304V8.88596Z" fill="#D8FF3B" stroke="black" strokeWidth="3"/>
      <path d="M109.824 8.88572C109.824 4.8067 106.517 1.5 102.438 1.5C98.3594 1.5 95.0527 4.8067 95.0527 8.88572V66.3302C95.0527 70.4092 98.3594 73.7159 102.438 73.7159C106.517 73.7159 109.824 70.4092 109.824 66.3302V8.88572Z" fill="#D8FF3B" stroke="black" strokeWidth="3"/>
      <path d="M129.519 17.9127C129.519 14.2869 126.58 11.3477 122.954 11.3477C119.328 11.3477 116.389 14.2869 116.389 17.9127V57.3032C116.389 60.929 119.328 63.8683 122.954 63.8683C126.58 63.8683 129.519 60.929 129.519 57.3032V17.9127Z" fill="#D8FF3B" stroke="black" strokeWidth="3"/>
      <path d="M147.572 26.94C147.572 23.7674 145.001 21.1956 141.828 21.1956C138.655 21.1956 136.083 23.7674 136.083 26.94V48.2765C136.083 51.4491 138.655 54.021 141.828 54.021C145.001 54.021 147.572 51.4491 147.572 48.2765V26.94Z" fill="#D8FF3B" stroke="black" strokeWidth="3"/>
      <path d="M56.4824 32.6841H84.384" stroke="black" strokeWidth="3" strokeLinecap="round"/>
      <path d="M64.6895 42.5317H92.591" stroke="black" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

export function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 4l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5L21 21" strokeLinecap="round" />
    </svg>
  );
}

export function FilterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M2 5h16M5 10h10M8 15h4" strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 4v12M4 10h12" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

export function EditIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M13.5 3.5l3 3L5 18H2v-3L13.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AddToWorkoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M3 5h10M3 10h7M3 15h5" strokeLinecap="round" />
      <path d="M15 11v6M12 14h6" strokeLinecap="round" />
    </svg>
  );
}

export function DragHandleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <circle cx="5.5" cy="3.5" r="1.5" />
      <circle cx="12.5" cy="3.5" r="1.5" />
      <circle cx="5.5" cy="9" r="1.5" />
      <circle cx="12.5" cy="9" r="1.5" />
      <circle cx="5.5" cy="14.5" r="1.5" />
      <circle cx="12.5" cy="14.5" r="1.5" />
    </svg>
  );
}

export function ChevronDownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 9v5" strokeLinecap="round" />
      <circle cx="10" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M3 5h14" strokeLinecap="round" />
      <path d="M8 5V3.5h4V5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 5l1 11.5h8L15 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 9v5M11.5 9v5" strokeLinecap="round" />
    </svg>
  );
}
