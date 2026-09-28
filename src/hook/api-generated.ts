/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface LoginDto {
  /** @example "admin@lemigas.esdm.go.id" */
  email: string;
  /** @example "password123" */
  password: string;
}

export interface AksesItemDto {
  /** @example "eyJhbGciOiJI..." */
  token: string;
  /** @example "Operator" */
  akses: string;
}

export interface LoginUserDto {
  /** @example "012ace5b-e8fe-4411-8d05-deb79e2979ae" */
  id_pegawai: string;
  /** @example "Ahmad Fauzi" */
  nama: string;
  /** @example "https://example.com/photo.jpg" */
  foto: string;
  akses: AksesItemDto[];
}

export interface CreateVendorDto {
  /** Nama vendor / perusahaan */
  nama: string;
  /** Alamat lengkap */
  alamat?: string;
  /** Nomor telepon */
  telepon?: string;
  /** Email vendor */
  email?: string;
  /** NPWP */
  npwp?: string;
  /** Nama contact person */
  contactPerson?: string;
  /** @default "aktif" */
  status?: "aktif" | "nonaktif";
}

export interface UpdateVendorDto {
  /** Nama vendor / perusahaan */
  nama?: string;
  /** Alamat lengkap */
  alamat?: string;
  /** Nomor telepon */
  telepon?: string;
  /** Email vendor */
  email?: string;
  /** NPWP */
  npwp?: string;
  /** Nama contact person */
  contactPerson?: string;
  status?: "aktif" | "nonaktif";
}

export interface CreateKategoriDto {
  /**
   * Kode kategori (unik)
   * @example "OIL"
   */
  kode: string;
  /** Nama kategori */
  nama: string;
}

export interface UpdateKategoriDto {
  /** Kode kategori (unik) */
  kode?: string;
  /** Nama kategori */
  nama?: string;
}

export interface CreateBarangDto {
  /** Nama barang */
  nama: string;
  /** Spesifikasi barang */
  spesifikasi?: string;
  /**
   * Satuan (pcs, kg, liter, dll)
   * @example "kg"
   */
  satuan: string;
  /** UUID Kategori Pengadaan */
  kategoriId: string;
  /** Harga estimasi per satuan */
  hargaEstimasi?: number;
}

export interface UpdateBarangDto {
  /** Nama barang */
  nama?: string;
  /** Spesifikasi barang */
  spesifikasi?: string;
  /** Satuan */
  satuan?: string;
  /** UUID Kategori Pengadaan */
  kategoriId?: string;
  /** Harga estimasi per satuan */
  hargaEstimasi?: number;
}

export interface PengadaanItemDto {
  /** UUID Barang */
  barangId: string;
  /** UUID Vendor */
  vendorId?: string;
  /** Jumlah / quantity */
  jumlah: number;
  /** Harga satuan */
  hargaSatuan?: number;
  /** Catatan item */
  catatan?: string;
}

export interface CreatePengadaanDto {
  /** Judul pengadaan */
  judul: string;
  /** Deskripsi pengadaan */
  deskripsi?: string;
  /** Metode pengadaan */
  metode: "tender" | "pengadaan_langsung" | "penunjukan_langsung" | "e_procurement";
  /** @default "sedang" */
  prioritas?: "rendah" | "sedang" | "tinggi" | "darurat";
  /** Tanggal pengajuan (YYYY-MM-DD) */
  tanggalPengajuan?: string;
  /** Tanggal deadline (YYYY-MM-DD) */
  tanggalDeadline?: string;
  /** Unit kerja */
  unitKerja?: string;
  /** Item barang */
  items: PengadaanItemDto[];
}

export interface UpdatePengadaanDto {
  /** Judul pengadaan */
  judul?: string;
  /** Deskripsi pengadaan */
  deskripsi?: string;
  metode?: "tender" | "pengadaan_langsung" | "penunjukan_langsung" | "e_procurement";
  prioritas?: "rendah" | "sedang" | "tinggi" | "darurat";
  status?: "draft" | "diajukan" | "dalam_review" | "disetujui" | "ditolak" | "revisi" | "sedang_proses" | "selesai" | "dibatalkan";
  /** Tanggal pengajuan (YYYY-MM-DD) */
  tanggalPengajuan?: string;
  /** Tanggal deadline (YYYY-MM-DD) */
  tanggalDeadline?: string;
  /** Unit kerja */
  unitKerja?: string;
  /** Item barang (replace) */
  items?: PengadaanItemDto[];
}

export interface DecisionDto {
  /** Keputusan approval */
  decision: "disetujui" | "ditolak";
  /** Catatan keputusan */
  catatan?: string;
}

export interface CreateUserDto {
  /** Nama lengkap */
  nama: string;
  /** Email (unik) */
  email: string;
  /** Password minimal 6 karakter */
  password: string;
  /** UUID Role */
  roleId: string;
  /** Unit kerja */
  unitKerja?: string;
  /** @default "aktif" */
  status?: "aktif" | "nonaktif";
}

export interface UpdateUserDto {
  /** Nama lengkap */
  nama?: string;
  /** Email */
  email?: string;
  /** Password baru */
  password?: string;
  /** UUID Role */
  roleId?: string;
  /** Unit kerja */
  unitKerja?: string;
  status?: "aktif" | "nonaktif";
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
    return keys.map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key))).join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) => (input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input),
    [ContentType.JsonApi]: (input: any) => (input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input),
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== "string" ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(key, property instanceof Blob ? property : typeof property === "object" && property !== null ? JSON.stringify(property) : `${property}`);
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({ body, secure, path, type, query, format, baseUrl, cancelToken, ...params }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams = ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) && this.securityWorker && (await this.securityWorker(this.securityData))) || {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format || "json";

    return this.customFetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
      },
      signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
      body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Pengadaan Minyak API
 * @version 1.0
 * @contact
 *
 * Dokumentasi API untuk aplikasi Pengadaan Minyak LEMIGAS
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  app = {
    /**
     * No description
     *
     * @tags App
     * @name AppControllerGetHello
     * @request GET:/
     */
    appControllerGetHello: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/`,
        method: "GET",
        ...params,
      }),
  };
  health = {
    /**
     * No description
     *
     * @tags Health
     * @name HealthCheck
     * @summary api health check
     * @request GET:/api/health
     */
    healthCheck: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/health`,
        method: "GET",
        ...params,
      }),
  };
  auth = {
    /**
     * No description
     *
     * @tags Auth
     * @name LoginUser
     * @summary Login user dan dapatkan JWT token
     * @request POST:/api/auth/login
     */
    loginUser: (data: LoginDto, params: RequestParams = {}) =>
      this.request<LoginUserDto, any>({
        path: `/api/auth/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name GetCurrentUser
     * @summary Dapatkan data user dari token JWT
     * @request GET:/api/auth/me
     * @secure
     */
    getCurrentUser: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/auth/me`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
  vendor = {
    /**
     * No description
     *
     * @tags Vendor
     * @name VendorGetControllerFindAll
     * @summary Ambil daftar vendor (paginasi + pencarian)
     * @request GET:/api/vendor
     * @secure
     */
    vendorGetControllerFindAll: (
      query?: {
        /** Pencarian / filter bebas */
        query?: string;
        /** @default 10 */
        limit?: number;
        /** @default 1 */
        page?: number;
        /** Filter status vendor */
        status?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/vendor`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Vendor
     * @name VendorPostControllerCreate
     * @summary Tambah vendor baru (Admin, Operator)
     * @request POST:/api/vendor
     * @secure
     */
    vendorPostControllerCreate: (data: CreateVendorDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/vendor`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Vendor
     * @name VendorGetControllerFindOne
     * @summary Ambil detail vendor berdasarkan ID
     * @request GET:/api/vendor/{id}
     * @secure
     */
    vendorGetControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/vendor/${id}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Vendor
     * @name VendorPutControllerUpdate
     * @summary Update vendor (Admin, Operator)
     * @request PUT:/api/vendor/{id}
     * @secure
     */
    vendorPutControllerUpdate: (id: string, data: UpdateVendorDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/vendor/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Vendor
     * @name VendorDeleteControllerRemove
     * @summary Hapus vendor (Admin)
     * @request DELETE:/api/vendor/{id}
     * @secure
     */
    vendorDeleteControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/vendor/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
  kategoriPengadaan = {
    /**
     * No description
     *
     * @tags Kategori Pengadaan
     * @name KategoriGetControllerFindAll
     * @summary Ambil daftar kategori pengadaan
     * @request GET:/api/kategori
     * @secure
     */
    kategoriGetControllerFindAll: (
      query?: {
        /** Pencarian / filter bebas */
        query?: string;
        /** @default 10 */
        limit?: number;
        /** @default 1 */
        page?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/kategori`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Kategori Pengadaan
     * @name KategoriPostControllerCreate
     * @summary Tambah kategori baru (Admin)
     * @request POST:/api/kategori
     * @secure
     */
    kategoriPostControllerCreate: (data: CreateKategoriDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/kategori`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Kategori Pengadaan
     * @name KategoriPutControllerUpdate
     * @summary Update kategori (Admin)
     * @request PUT:/api/kategori/{id}
     * @secure
     */
    kategoriPutControllerUpdate: (id: string, data: UpdateKategoriDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/kategori/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Kategori Pengadaan
     * @name KategoriDeleteControllerRemove
     * @summary Hapus kategori (Admin)
     * @request DELETE:/api/kategori/{id}
     * @secure
     */
    kategoriDeleteControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/kategori/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
  barang = {
    /**
     * No description
     *
     * @tags Barang
     * @name BarangGetControllerFindAll
     * @summary Ambil daftar barang (paginasi + filter)
     * @request GET:/api/barang
     * @secure
     */
    barangGetControllerFindAll: (
      query?: {
        /** Pencarian / filter bebas */
        query?: string;
        /** @default 10 */
        limit?: number;
        /** @default 1 */
        page?: number;
        /** Filter by kategori ID */
        kategoriId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/barang`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Barang
     * @name BarangPostControllerCreate
     * @summary Tambah barang baru (Admin, Operator)
     * @request POST:/api/barang
     * @secure
     */
    barangPostControllerCreate: (data: CreateBarangDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/barang`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Barang
     * @name BarangGetControllerFindOne
     * @summary Ambil detail barang berdasarkan ID
     * @request GET:/api/barang/{id}
     * @secure
     */
    barangGetControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/barang/${id}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Barang
     * @name BarangPutControllerUpdate
     * @summary Update barang (Admin, Operator)
     * @request PUT:/api/barang/{id}
     * @secure
     */
    barangPutControllerUpdate: (id: string, data: UpdateBarangDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/barang/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Barang
     * @name BarangDeleteControllerRemove
     * @summary Hapus barang (Admin)
     * @request DELETE:/api/barang/{id}
     * @secure
     */
    barangDeleteControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/barang/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
  pengadaan = {
    /**
     * No description
     *
     * @tags Pengadaan
     * @name PengadaanGetControllerFindAll
     * @summary Ambil daftar pengadaan (paginasi + filter)
     * @request GET:/api/pengadaan
     * @secure
     */
    pengadaanGetControllerFindAll: (
      query?: {
        /** Pencarian / filter bebas */
        query?: string;
        /** @default 10 */
        limit?: number;
        /** @default 1 */
        page?: number;
        status?: "draft" | "diajukan" | "dalam_review" | "disetujui" | "ditolak" | "revisi" | "sedang_proses" | "selesai" | "dibatalkan";
        metode?: "tender" | "pengadaan_langsung" | "penunjukan_langsung" | "e_procurement";
        prioritas?: "rendah" | "sedang" | "tinggi" | "darurat";
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/pengadaan`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Pengadaan
     * @name PengadaanPostControllerCreate
     * @summary Buat pengadaan baru (Admin, Operator)
     * @request POST:/api/pengadaan
     * @secure
     */
    pengadaanPostControllerCreate: (data: CreatePengadaanDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/pengadaan`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Pengadaan
     * @name PengadaanGetControllerFindOne
     * @summary Ambil detail pengadaan
     * @request GET:/api/pengadaan/{id}
     * @secure
     */
    pengadaanGetControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/pengadaan/${id}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Pengadaan
     * @name PengadaanPutControllerUpdate
     * @summary Update pengadaan (Admin, Operator)
     * @request PUT:/api/pengadaan/{id}
     * @secure
     */
    pengadaanPutControllerUpdate: (id: string, data: UpdatePengadaanDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/pengadaan/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Pengadaan
     * @name PengadaanDeleteControllerRemove
     * @summary Hapus pengadaan (Admin)
     * @request DELETE:/api/pengadaan/{id}
     * @secure
     */
    pengadaanDeleteControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/pengadaan/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
  approval = {
    /**
     * No description
     *
     * @tags Approval
     * @name ApprovalGetControllerFindAll
     * @summary Daftar pengadaan yang perlu di-approve
     * @request GET:/api/approval
     * @secure
     */
    approvalGetControllerFindAll: (
      query?: {
        /** Pencarian / filter bebas */
        query?: string;
        /** @default 10 */
        limit?: number;
        /** @default 1 */
        page?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/approval`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Approval
     * @name ApprovalGetControllerFindMyPengadaan
     * @summary Daftar pengadaan yang saya ajukan
     * @request GET:/api/approval/my
     * @secure
     */
    approvalGetControllerFindMyPengadaan: (
      query?: {
        /** Pencarian / filter bebas */
        query?: string;
        /** @default 10 */
        limit?: number;
        /** @default 1 */
        page?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/approval/my`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Approval
     * @name ApprovalGetControllerGetHistory
     * @summary Riwayat approval pengadaan
     * @request GET:/api/approval/history/{pengadaanId}
     * @secure
     */
    approvalGetControllerGetHistory: (pengadaanId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/approval/history/${pengadaanId}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Approval
     * @name ApprovalActionControllerSubmit
     * @summary Ajukan pengadaan untuk approval (Admin, Operator)
     * @request POST:/api/approval/submit/{pengadaanId}
     * @secure
     */
    approvalActionControllerSubmit: (pengadaanId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/approval/submit/${pengadaanId}`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Approval
     * @name ApprovalActionControllerDecide
     * @summary Proses keputusan approval (Admin, Verifikator, Pimpinan)
     * @request POST:/api/approval/decide/{pengadaanId}/{stepId}
     * @secure
     */
    approvalActionControllerDecide: (pengadaanId: string, stepId: string, data: DecisionDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/approval/decide/${pengadaanId}/${stepId}`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  dokumen = {
    /**
     * No description
     *
     * @tags Dokumen
     * @name DokumenGetControllerFindAll
     * @summary Ambil daftar dokumen (paginasi)
     * @request GET:/api/dokumen
     * @secure
     */
    dokumenGetControllerFindAll: (
      query?: {
        /** Pencarian / filter bebas */
        query?: string;
        /** @default 10 */
        limit?: number;
        /** @default 1 */
        page?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/dokumen`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dokumen
     * @name DokumenGetControllerFindOne
     * @summary Ambil detail dokumen
     * @request GET:/api/dokumen/{id}
     * @secure
     */
    dokumenGetControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/dokumen/${id}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dokumen
     * @name DokumenDeleteControllerRemove
     * @summary Hapus dokumen (Admin)
     * @request DELETE:/api/dokumen/{id}
     * @secure
     */
    dokumenDeleteControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/dokumen/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dokumen
     * @name DokumenGetControllerFindByPengadaan
     * @summary Ambil dokumen berdasarkan pengadaan
     * @request GET:/api/dokumen/by-pengadaan/{pengadaanId}
     * @secure
     */
    dokumenGetControllerFindByPengadaan: (pengadaanId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/dokumen/by-pengadaan/${pengadaanId}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Dokumen
     * @name DokumenPostControllerUpload
     * @summary Upload dokumen (Admin, Operator)
     * @request POST:/api/dokumen/upload
     * @secure
     */
    dokumenPostControllerUpload: (
      data: {
        /** @format binary */
        file?: File;
        pengadaanId?: string;
        nama?: string;
        tipePenyimpanan?: "upload_lokal" | "link_eksternal";
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/dokumen/upload`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        ...params,
      }),
  };
  user = {
    /**
     * No description
     *
     * @tags User
     * @name UserGetControllerFindAll
     * @summary Ambil daftar user (paginasi)
     * @request GET:/api/user
     * @secure
     */
    userGetControllerFindAll: (
      query?: {
        /** Pencarian / filter bebas */
        query?: string;
        /** @default 10 */
        limit?: number;
        /** @default 1 */
        page?: number;
        status?: "aktif" | "nonaktif";
        /** Filter by role ID */
        roleId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/user`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserPostControllerCreate
     * @summary Tambah user baru (Admin)
     * @request POST:/api/user
     * @secure
     */
    userPostControllerCreate: (data: CreateUserDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/user`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserGetControllerGetRoles
     * @summary Ambil daftar role
     * @request GET:/api/user/roles
     * @secure
     */
    userGetControllerGetRoles: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/user/roles`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserGetControllerFindOne
     * @summary Ambil detail user
     * @request GET:/api/user/{id}
     * @secure
     */
    userGetControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/user/${id}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserPutControllerUpdate
     * @summary Update user (Admin)
     * @request PUT:/api/user/{id}
     * @secure
     */
    userPutControllerUpdate: (id: string, data: UpdateUserDto, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/user/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserDeleteControllerRemove
     * @summary Hapus user (Admin)
     * @request DELETE:/api/user/{id}
     * @secure
     */
    userDeleteControllerRemove: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/user/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
  notifikasi = {
    /**
     * No description
     *
     * @tags Notifikasi
     * @name NotifikasiGetControllerFindAll
     * @summary Ambil daftar notifikasi user
     * @request GET:/api/notifikasi
     * @secure
     */
    notifikasiGetControllerFindAll: (
      query?: {
        /** Pencarian / filter bebas */
        query?: string;
        /** @default 10 */
        limit?: number;
        /** @default 1 */
        page?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/notifikasi`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Notifikasi
     * @name NotifikasiPutControllerMarkAsRead
     * @summary Tandai notifikasi sudah dibaca
     * @request PUT:/api/notifikasi/{id}/read
     * @secure
     */
    notifikasiPutControllerMarkAsRead: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/notifikasi/${id}/read`,
        method: "PUT",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Notifikasi
     * @name NotifikasiPutControllerMarkAllAsRead
     * @summary Tandai semua notifikasi sudah dibaca
     * @request PUT:/api/notifikasi/read-all
     * @secure
     */
    notifikasiPutControllerMarkAllAsRead: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/notifikasi/read-all`,
        method: "PUT",
        secure: true,
        ...params,
      }),
  };
  auditLog = {
    /**
     * No description
     *
     * @tags Audit Log
     * @name AuditLogGetControllerFindAll
     * @summary Ambil daftar audit log (paginasi)
     * @request GET:/api/audit-log
     * @secure
     */
    auditLogGetControllerFindAll: (
      query?: {
        recordId?: any;
        tabel?: any;
        aksi?: any;
        query?: any;
        limit?: any;
        page?: any;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/audit-log`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Audit Log
     * @name AuditLogGetControllerFindByRecord
     * @summary Audit log untuk record tertentu
     * @request GET:/api/audit-log/by-record/{tabel}/{recordId}
     * @secure
     */
    auditLogGetControllerFindByRecord: (tabel: string, recordId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/audit-log/by-record/${tabel}/${recordId}`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
  dashboard = {
    /**
     * No description
     *
     * @tags Dashboard
     * @name DashboardGetControllerGetStats
     * @summary Statistik dashboard
     * @request GET:/api/dashboard
     * @secure
     */
    dashboardGetControllerGetStats: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/dashboard`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
}
