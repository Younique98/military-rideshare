/**
 * Shared throwaway "service account" for talking to the local Firebase
 * emulators (Auth + Firestore) — used by scripts/verify-firebase-admin-migration.ts
 * and by the Playwright e2e suite (e2e/support/firebaseAdmin.ts).
 *
 * Emulators never verify this key cryptographically or contact real Google
 * infrastructure with it, but firebase-admin's cert() still parses it as a
 * real PEM key (Node's crypto.createPrivateKey), so it has to be a
 * structurally valid RSA key — not real credentials for anything, and not
 * associated with any real Firebase/GCP project. Generated fresh for this
 * repo via `openssl genrsa 2048`.
 */
const THROWAWAY_TEST_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDBIdfuN+pHm/sb
VkoGqelRbJdun9bCLVTwF8ZAA/7R7PB0vAX3JceGZXq4cQqTSPTOcbS+0ZwdRYak
QSDwAPXfcFgrGGtAkV0zUf9CovUZMpvPGLPul0CT6DRdB5FjYP9lunAgXDbE+ccX
nIi8Yjg7tgw5Lq2Yzw6S3JTF0Upwi/zsOJzXM0s3hRy8yJLZ4FAUOG7Mi7Qq7u4Q
LxW855ndj8DAfnJbEYsqw71BD5/6GNR37E3C5gWAYnnv46cfFzEavYG9nd1u2D2D
EzReJCgCjxrANsYNLYMOoqV8oXJvNgD7C+wxxd5yiuLnwAeql37aoZ9Yd8nCatbj
iCEGo9FbAgMBAAECggEADcyHu48GL7Ce2+Cp8FjygS1TkoVcGEqZ33+rXAaNDd2y
fnyypmpuG5Wjk4sMGOLlDt0D74BVeafui0zV+B/xcVH7ErUvcJESSijpJo8zGOZL
SJw4uurWo9q65wyz4Bhdlxyfh0hfZ2p7RZ4bDO6tmuKSdAF4SMs+fNLC1HF0Mp9G
F8F6IsIjADUlFoEZ1w6kbHtrd2nykNx2/8DvJ8ejdNpNHjZfSyYX5k7lhvKras+Y
VpNrde5KrMke46PjW/tlUW1rdZSF0iAbdMfCVu3x/g9kqok6oVTRsc4qyZ3yhEQ9
O6OG2Lleh61OnRHIpFKYUez44J91MjUpa2P41wvdOQKBgQDovfP5pI0hZYcLY8Db
8GG5pK22seLfoCP+u0LTbd+vI+NPx36ZZb+v3INxwWuKTVdW7tItLmVsgCN2ujmz
UT29z7LBNdKy6DW6WLdJY9WrwjG5YtFTNiz/czmC1QtmMU/cZgQBwlaXibLbINqq
/wRX4j4x13SU39a8bnYkCQgRmQKBgQDUbpXir6QSWOoDsvRlhlIx/0E+Rwe9yCjz
T5GXT7nAN/N2HG1av2RxP4A+DtC0QEJe4fvrT4wuqQ5YX7DzSrSc029Mp2USfVg1
ibHT7GCIAWqnNjPTMgF4LIRNVnDIIvWPcc7k31XzO2gvArZcMx7GnEAs4Hptkg4R
n/5SOQZ7EwKBgDoXn5wCLI/XbZu0LGE5YMsbhZiCUiSLLjDYwNdRJ3HpvUUegET9
lpjoq45rPtJod5JlTeSlHf+1BCUQWnKdppGIFBARxSOOvkpi9mzFFIIomIyzU5g3
f4fLVOGJF61MRai3deySe1absh7r1miz+nuNJwT9yEWYkVq7H5XjAzaRAoGAFM9Q
d4hlNjbnlb0uG9PwsV0j8wnaREkbWdptlLkGpUHV47gdLkqZeE6ULYAeCcpRtiHF
H+QHA3skIJwfJXYoA0TjHks3p3wH7Ba1COGbAzfATukMYp//bNpPi5PwMGrcS1UG
w3ztWopzRkepvZZ0aVhdIQhMdfdc0XUu4LcdX2kCgYBroCS7q5naMPUmbyAo09fW
fA1nguGZjxNhA8/LGbhNdd3b0aNI+ALA6lIGccfsea7zJ7N/O+0cfVcD90DKAa5o
lkIyvofHegLqxhItCBmItCkE9Fw4HGT4x4F8qD9lCEqVp2j0oR4c6rH3PykiAsCy
E3YhhBVjsDPP/mQWuU+9TQ==
-----END PRIVATE KEY-----
`

export const TEST_FIREBASE_PROJECT_ID = 'demo-baselink'

export const THROWAWAY_TEST_SERVICE_ACCOUNT_KEY = JSON.stringify({
    project_id: TEST_FIREBASE_PROJECT_ID,
    client_email: 'fake@demo-baselink.iam.gserviceaccount.com',
    private_key: THROWAWAY_TEST_PRIVATE_KEY,
})
