import { Request, Response } from 'express';
import { SearchPersonUseCase } from '../../application/usecases/SearchPersonUseCase.js';
/**
 * Controller para endpoints de busca
 * Camada de apresentação seguindo Clean Architecture
 */
export declare class SearchController {
    private readonly searchPersonUseCase;
    constructor(searchPersonUseCase: SearchPersonUseCase);
    searchPerson(req: Request, res: Response): Promise<void>;
    healthCheck(req: Request, res: Response): Promise<void>;
    getMetrics(req: Request, res: Response): Promise<void>;
    private formatPrometheusMetrics;
}
//# sourceMappingURL=SearchController.d.ts.map