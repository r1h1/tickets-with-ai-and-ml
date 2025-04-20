CREATE TABLE Users (
                       UserId INT PRIMARY KEY IDENTITY(1,1),
                       Name NVARCHAR(100) NOT NULL,
                       Email NVARCHAR(150) NOT NULL UNIQUE,
                       RoleId INT NOT NULL,
                       IsActive BIT DEFAULT 1,
                       CreatedAt DATETIME DEFAULT GETDATE(),
                       FOREIGN KEY (RoleId) REFERENCES Roles(RoleId)
);

CREATE TABLE Auth (
                      AuthId INT PRIMARY KEY IDENTITY(1,1),
                      UserId INT NOT NULL UNIQUE,
                      PasswordHash NVARCHAR(255) NOT NULL,
                      Salt NVARCHAR(100),
                      LastLogin DATETIME,
                      FOREIGN KEY (UserId) REFERENCES Users(UserId)
);


CREATE TABLE Roles (
                       RoleId INT PRIMARY KEY IDENTITY(1,1),
                       RoleName NVARCHAR(50) NOT NULL UNIQUE,
                       AssignedMenus NVARCHAR(MAX) -- Ej: 'start.html,usuarios.html,tickets.html'
);


CREATE TABLE Tickets (
                         TicketId INT PRIMARY KEY IDENTITY(1,1),
                         Title NVARCHAR(200) NOT NULL,
                         Description NVARCHAR(MAX),
                         Problem NVARCHAR(MAX),
                         Priority NVARCHAR(20), -- CRÍTICA, ALTA, MEDIA, BAJA
                         Status NVARCHAR(20) DEFAULT 'Nuevo',
                         CreatedAt DATETIME DEFAULT GETDATE(),
                         AssignedTo INT NULL, -- Técnico asignado
                         CreatedBy INT NOT NULL,
                         ClassifiedByML BIT DEFAULT 1,
                         FOREIGN KEY (CreatedBy) REFERENCES Users(UserId),
                         FOREIGN KEY (AssignedTo) REFERENCES Users(UserId)
);


CREATE TABLE Categories (
                            CategoryId INT PRIMARY KEY IDENTITY(1,1),
                            Name NVARCHAR(100) NOT NULL,
                            Description NVARCHAR(255)
);


CREATE TABLE TicketCategories (
                                  TicketId INT,
                                  CategoryId INT,
                                  PRIMARY KEY (TicketId, CategoryId),
                                  FOREIGN KEY (TicketId) REFERENCES Tickets(TicketId),
                                  FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId)
);


CREATE TABLE ChatLogs (
                          LogId INT PRIMARY KEY IDENTITY(1,1),
                          TicketId INT NOT NULL,
                          Question NVARCHAR(MAX),
                          Answer NVARCHAR(MAX),
                          CreatedAt DATETIME DEFAULT GETDATE(),
                          FOREIGN KEY (TicketId) REFERENCES Tickets(TicketId)
);


CREATE TABLE TicketHistory (
                               HistoryId INT PRIMARY KEY IDENTITY(1,1),
                               TicketId INT NOT NULL,
                               ChangedBy INT NOT NULL,
                               FieldChanged NVARCHAR(100),
                               OldValue NVARCHAR(255),
                               NewValue NVARCHAR(255),
                               ChangeDate DATETIME DEFAULT GETDATE(),
                               FOREIGN KEY (TicketId) REFERENCES Tickets(TicketId),
                               FOREIGN KEY (ChangedBy) REFERENCES Users(UserId)
);