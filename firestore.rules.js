rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // FUNÇÕES AUXILIARES DE SEGURANÇA
    // ============================================
    
    // Verifica se usuário está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Verifica se o usuário é o dono do documento
    function isOwner(userIdField) {
      return request.auth != null && request.auth.uid == resource.data[userIdField];
    }
    
    // Verifica se está criando um documento próprio
    function isCreatingOwn(userIdField) {
      return request.auth != null && request.auth.uid == request.resource.data[userIdField];
    }
    
    // Verifica se o email do usuário foi verificado
    function isEmailVerified() {
      return request.auth != null && request.auth.token.email_verified == true;
    }
    
    // Verifica se é administrador
    function isAdmin() {
      return request.auth != null && request.auth.token.email == 'admin@ServMatch.com';
    }
    
    // ============================================
    // REGRAS: PRESTADORES
    // ============================================
    match /prestadores/{document} {
      allow read: if true;
      allow create: if isAuthenticated() 
        && isEmailVerified() 
        && isCreatingOwn('userId');
      allow update: if isAuthenticated() 
        && isEmailVerified() 
        && isOwner('userId');
      allow delete: if false;
    }
    
    // ============================================
    // REGRAS: CLIENTES
    // ============================================
    match /clientes/{document} {
      allow read: if isAuthenticated() 
        && (request.auth.uid == document || isAdmin());
      allow create: if isAuthenticated() 
        && isEmailVerified() 
        && request.auth.uid == document;
      allow update: if isAuthenticated() 
        && isEmailVerified() 
        && request.auth.uid == document;
      allow delete: if false;
    }
    
    // ============================================
    // REGRAS: AVALIAÇÕES
    // ============================================
    match /avaliacoes/{document} {
      allow read: if true;
      allow create: if isAuthenticated() 
        && isEmailVerified() 
        && request.resource.data.clienteId == request.auth.uid;
      allow update: if false;
      allow delete: if false;
    }
    
    // ============================================
    // REGRAS: PEDIDOS
    // ============================================
    match /pedidos/{document} {
      allow read: if isAuthenticated() && (
        request.auth.uid == resource.data.clienteId ||
        request.auth.uid == resource.data.prestadorUserId ||
        isAdmin()
      );
      
      allow create: if isAuthenticated() 
        && isEmailVerified() 
        && request.resource.data.clienteId == request.auth.uid;
      
      allow update: if isAuthenticated() && (
        request.auth.uid == resource.data.clienteId ||
        request.auth.uid == resource.data.prestadorUserId ||
        isAdmin()
      );
      
      allow delete: if isAuthenticated() 
        && request.auth.uid == resource.data.clienteId 
        && resource.data.status == 'pendente';
    }
    
    // ============================================
    // REGRA CURINGA - BLOQUEIA TUDO
    // ============================================
    match /{document=**} {
      allow read, write: if false;
    }
  }
}