import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CartService } from '../../core/services/cart.service';

/** The human confirms the order here; agents can fill the cart but there is deliberately no checkout tool. */
@Component({
  selector: 'app-checkout-page',
  imports: [CurrencyPipe, RouterLink, FormRoot, FormField, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <a mat-button routerLink="/cart">← Back to cart</a>
    <h1>Checkout</h1>
    @if (cart.count()) {
      <p>{{ cart.count() }} items · Total {{ cart.total() | currency: 'USD' }}</p>
      <form [formRoot]="checkoutForm">
        <mat-form-field appearance="outline">
          <mat-label>Email for the receipt</mat-label>
          <input matInput type="email" autocomplete="email" [formField]="checkoutForm.email" />
          @if (checkoutForm.email().touched() && checkoutForm.email().invalid()) {
            <mat-error>Enter a valid email address.</mat-error>
          }
        </mat-form-field>
        <p class="note">Payment is simulated: no card is charged.</p>
        <button mat-flat-button type="submit" [disabled]="checkoutForm().submitting()">Place order</button>
      </form>
      @if (error()) { <p role="alert" class="error">{{ error() }}</p> }
    } @else {
      <p>Your cart is empty. <a routerLink="/products">Browse the catalog</a>.</p>
    }
  `,
  styles: `
    form { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; max-width: 400px; }
    mat-form-field { width: 100%; }
    .note { color: var(--mat-sys-on-surface-variant); margin: 0; }
    .error { color: var(--mat-sys-error); }
  `,
})
export class CheckoutPage {
  protected readonly cart = inject(CartService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly error = signal('');

  private readonly model = signal({ email: '' });
  protected readonly checkoutForm = form(
    this.model,
    (p) => {
      required(p.email);
      email(p.email);
    },
    {
      submission: {
        action: async () => {
          this.error.set('');
          const result = await this.cart.checkout(this.model().email.trim());
          if (!result.ok) {
            this.error.set(result.error);
            return undefined;
          }
          this.snackBar.open('Order placed', 'OK', { duration: 3000 });
          await this.router.navigate(['/orders']);
          return undefined;
        },
      },
    },
  );
}
