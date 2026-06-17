import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UsersComponent } from './user';
import { UsersService } from '../../../core/users/users.service';
import { of } from 'rxjs';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let mockUsersService: any;

  beforeEach(async () => {
    mockUsersService = {
      getUsers: () => of({ status: 'success', results: 0, data: { users: [] } }),
      createUser: () => of({ status: 'success', data: { user: {} as any } }),
      updateUser: () => of({ status: 'success', data: { user: {} as any } }),
      deleteUser: () => of({ status: 'success', message: 'deleted' }),
      changeUserPlan: () => of({ status: 'success' })
    };

    await TestBed.configureTestingModule({
      imports: [UsersComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UsersService, useValue: mockUsersService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
