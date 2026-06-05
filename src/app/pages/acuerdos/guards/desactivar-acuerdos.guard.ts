import { CanDeactivateFn } from '@angular/router';
import { AcuerdosComponent } from '../acuerdos.component';

export const desactivarAcuerdosGuard: CanDeactivateFn<AcuerdosComponent> = (component) => {
  console.log('[desactivarAcuerdosGuard] Guard function invoked, component exists:', !!component);
  if (!component) {
    console.log('[desactivarAcuerdosGuard] No component found, allowing navigation');
    return true;
  }
  
  if (typeof component.canDeactivate === 'function') {
    const result = component.canDeactivate();
    console.log('[desactivarAcuerdosGuard] Component canDeactivate() returned:', result);
    return result;
  }
  
  console.log('[desactivarAcuerdosGuard] Component does not have canDeactivate(), allowing navigation');
  return true;
};
