import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { BehaviorSubject } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { UiService } from "src/app/core/ui.service";
import { IProduct } from "src/app/shared/models/product.model";
import { environment } from "../../../environments/environment";
import { AlertDialogComponent } from "../../shared/components/alert-dialog/alert-dialog.component";
import { IUserPlan } from "../models/user-plan.model";
import { IUserPucrhcase } from "../models/user-purchases.model";

@Injectable()
export class JoolaService {

    private apiUrl = environment.apiUrl + 'joola/';
    private userPlans: IUserPlan[] = [];
    private userPlans$ = new BehaviorSubject<IUserPlan[]>([]);

    productsPath = environment.imagesUrl + 'products/';

    constructor(private http: HttpClient, private dialog: MatDialog, private uiService: UiService) { }

    initialLoadUserPlans() {
        this.http.get<IUserPlan[]>(this.apiUrl + 'user-plans?finished=false').subscribe(res => {
            this.userPlans = res;
            this.userPlans$.next(this.userPlans);
        }, error => {
            // TODO: Show error
        });
    }

    getUserPlans() {
        return this.userPlans$.asObservable();
    }

    deleteUserPlan(id: number) {
        this.http.delete(this.apiUrl + 'user-plans/' + id).subscribe(() => {
            const index = this.userPlans.findIndex(a => {
                return a.id == id;
            });
            this.userPlans.splice(index, 1);
            this.userPlans$.next(this.userPlans);
        }, error => {
            let msg = '';
            if (error.status === 404)
                msg = 'خطا، نقشه‌ی مورد نظر قبلاً حذف شده است';
            else if (error.status === 401)
                msg = 'خطا، شما مجاز به حذف این نقشه نمی‌باشید';
            this.dialog.open(AlertDialogComponent, {
                width: '350px',
                maxWidth: '600px',
                data: {
                    icon: 'mdi mdi-alert',
                    message: msg,
                    title: 'خطا به هنگام حذف نقشه',
                    iconColor: '#c00'
                }
            });
        });
    }

    addUserPlan(productId: number, raj: number, turned: boolean) {
        return this.http.post<IUserPlan>(this.apiUrl + 'user-plans', {
            productId,
            raj,
            turned
        }).pipe(map(res => {
            this.userPlans.push(res);
            this.userPlans$.next(this.userPlans);
            this.uiService.showSuccessSnack(`نقشه‌ی ${res.product.name} با موفقیت به لیست نقشه‌های در حال بافت، اضافه شد`);
        }), catchError(error => {
            this.dialog.open(AlertDialogComponent, {
                width: '350px',
                maxWidth: '600px',
                data: {
                    icon: 'mdi mdi-alert',
                    message: 'کد خطا: ' + error.status,
                    title: 'خطا به هنگام افزودن نقشه',
                    iconColor: '#c00'
                }
            });
            return null;
        }));
    }

    getUserPurchases() {
        return this.http.get<IUserPucrhcase[]>(this.apiUrl + 'user-purchases');
    }

    getArchivedUserPlans() {
        return this.http.get<IUserPlan[]>(this.apiUrl + 'user-plans?finished=true');
    }

    addFromArchive(id: number) {
        return this.http.patch<IUserPlan>(this.apiUrl + 'user-plans', id).pipe(map(res => {
            this.userPlans.push(res);
            this.userPlans$.next(this.userPlans);
            this.uiService.showSuccessSnack(`نقشه‌ی ${res.product.name} با موفقیت به لیست نقشه‌های در حال بافت، اضافه شد`);
        }), catchError(error => {
            this.dialog.open(AlertDialogComponent, {
                width: '350px',
                maxWidth: '600px',
                data: {
                    icon: 'mdi mdi-alert',
                    message: 'کد خطا: ' + error.status,
                    title: 'خطا به هنگام افزودن نقشه',
                    iconColor: '#c00'
                }
            });
            return null;
        }));
    }

    searchProducts(str: string) {
        return this.http.get<IProduct[]>(this.apiUrl + 'search-products?str=' + str);
    }

    async getUserPlanData(id: number) {
        return await this.http.get<number[]>(`${this.apiUrl}user-plans/${id}/data`).toPromise();
    }

    audioPath = './assets/joola-farsi/';
    private audioFiles = [
        '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
        '20', '30', '40', '50', '60', '70', '80', '90',
        '20_', '30_', '40_', '50_', '60_', '70_', '80_', '90_',
        '100', '200', '300', '400', '500', '600', '700', '800', '900',
        '100_', '200_', '300_', '400_', '500_', '600_', '700_', '800_', '900_',
        '1000', '1000_', 'ela', 'gereh', 'raj', 'rang'
    ];

    loadAudioFiles = async (): Promise<string[]> => await Promise.all(this.audioFiles.map(this.preloadAudio));

    private preloadAudio = (fileName: string): Promise<string> => {
        const audio = new Audio();
        audio.src = this.audioPath + fileName + '.mp3';
        return new Promise((resolve, reject) => audio.addEventListener('canplaythrough', () => {
            return resolve(fileName);
        }, false))
    }

    savePosition(id: number, position: number): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            this.http.post(this.apiUrl + 'save-position', {
                id,
                position
            }).subscribe(() => {
                resolve();
            }, error => {
                console.log(error);
                this.uiService.showErrorSnack('خطا به هنگام ذخیره‌ی موقعیت بافت');
                resolve();
            });
        });
    }

    saveSpeed(id: number, speed: number) {
        this.http.post(this.apiUrl + 'save-speed', {
            id,
            speed
        }).subscribe(() => { }, error => {
            console.log(error);
            this.uiService.showErrorSnack('خطا به هنگام ذخیره‌ی سرعت بافت');
        });
    }

    savePlaySound(id: number, playSound: boolean) {
        this.http.post(this.apiUrl + 'save-play-sound', {
            id,
            playSound
        }).subscribe(() => { }, error => {
            console.log(error);
            this.uiService.showErrorSnack('خطا به هنگام ذخیره‌ی پخش صوت');
        });
    }
}